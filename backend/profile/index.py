import json
import os
import re
import base64
import boto3
import psycopg2

SCHEMA = 't_p79249079_api_url_update'
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Профиль пользователя Crack: получение и обновление данных."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    headers = event.get('headers') or {}
    uid_raw = headers.get('x-user-id') or params.get('user_id') or '1'
    user_id = int(uid_raw)
    action = params.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    # GET ?action=get — получить профиль
    if method == 'GET' and action == 'get':
        cur.execute(f"""
            SELECT id, username, display_name, avatar_initials, bio, email, avatar_url
            FROM {SCHEMA}.users WHERE id = %s
        """, (user_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
            'id': row[0], 'username': row[1], 'display_name': row[2],
            'avatar_initials': row[3], 'bio': row[4],
            'email': row[5] or '', 'avatar_url': row[6] or '',
        }, ensure_ascii=False)}

    # POST ?action=update_name — сменить отображаемое имя
    if method == 'POST' and action == 'update_name':
        body = json.loads(event.get('body') or '{}')
        name = body.get('display_name', '').strip()
        if not name or len(name) < 2:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Name too short'})}
        initials = ''.join(w[0].upper() for w in name.split()[:2])
        cur.execute(f"UPDATE {SCHEMA}.users SET display_name=%s, avatar_initials=%s WHERE id=%s", (name, initials, user_id))
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'display_name': name, 'avatar_initials': initials})}

    # POST ?action=update_username — сменить юзернейм
    if method == 'POST' and action == 'update_username':
        body = json.loads(event.get('body') or '{}')
        uname = body.get('username', '').strip().lower()
        if not uname or len(uname) < 3 or not re.match(r'^[a-z0-9_]+$', uname):
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Invalid username (min 3 chars, a-z0-9_)'})}
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username=%s AND id!=%s", (uname, user_id))
        if cur.fetchone():
            cur.close(); conn.close()
            return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Username already taken'})}
        cur.execute(f"UPDATE {SCHEMA}.users SET username=%s, username_updated_at=NOW() WHERE id=%s", (uname, user_id))
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'username': uname})}

    # POST ?action=update_email — привязать/сменить email
    if method == 'POST' and action == 'update_email':
        body = json.loads(event.get('body') or '{}')
        email = body.get('email', '').strip().lower()
        if not email or not re.match(r'^[^@]+@[^@]+\.[^@]+$', email):
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Invalid email'})}
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s AND id!=%s", (email, user_id))
        if cur.fetchone():
            cur.close(); conn.close()
            return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Email already used'})}
        cur.execute(f"UPDATE {SCHEMA}.users SET email=%s WHERE id=%s", (email, user_id))
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'email': email})}

    # POST ?action=update_avatar — загрузить фото (base64)
    if method == 'POST' and action == 'update_avatar':
        body = json.loads(event.get('body') or '{}')
        b64 = body.get('image_base64', '')
        mime = body.get('mime', 'image/jpeg')
        if not b64:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'No image'})}
        img_data = base64.b64decode(b64)
        ext = 'jpg' if 'jpeg' in mime else mime.split('/')[-1]
        key = f'avatars/user_{user_id}.{ext}'
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
        )
        s3.put_object(Bucket='files', Key=key, Body=img_data, ContentType=mime)
        url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/files/{key}"
        cur.execute(f"UPDATE {SCHEMA}.users SET avatar_url=%s WHERE id=%s", (url, user_id))
        conn.commit(); cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'avatar_url': url})}

    cur.close(); conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}
