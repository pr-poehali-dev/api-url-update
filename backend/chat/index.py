import json
import os
import psycopg2

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

SCHEMA = 't_p79249079_api_url_update'

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
}

def handler(event: dict, context) -> dict:
    """Чат Crack: диалоги и сообщения."""
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

    # GET ?action=conversations
    if method == 'GET' and action == 'conversations':
        cur.execute(f"""
            SELECT
                c.id,
                CASE WHEN c.user1_id = %s THEN c.user2_id ELSE c.user1_id END AS other_id,
                u.display_name,
                u.avatar_initials,
                u.bio,
                (SELECT text FROM {SCHEMA}.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
                (SELECT created_at FROM {SCHEMA}.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1)
            FROM {SCHEMA}.conversations c
            JOIN {SCHEMA}.users u ON u.id = CASE WHEN c.user1_id = %s THEN c.user2_id ELSE c.user1_id END
            WHERE c.user1_id = %s OR c.user2_id = %s
            ORDER BY 7 DESC NULLS LAST
        """, (user_id, user_id, user_id, user_id))
        rows = cur.fetchall()
        result = [{
            'id': r[0], 'other_user_id': r[1], 'name': r[2],
            'avatar': r[3], 'title': r[4],
            'last_message': r[5] or '',
            'last_time': r[6].strftime('%H:%M') if r[6] else '',
        } for r in rows]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result, ensure_ascii=False)}

    # GET ?action=messages&conv_id=X
    if method == 'GET' and action == 'messages':
        conv_id = int(params.get('conv_id', 0))
        cur.execute(f"""
            SELECT m.id, m.sender_id, m.text, m.created_at, u.display_name, u.avatar_initials
            FROM {SCHEMA}.messages m
            JOIN {SCHEMA}.users u ON u.id = m.sender_id
            WHERE m.conversation_id = %s
            ORDER BY m.created_at ASC
        """, (conv_id,))
        rows = cur.fetchall()
        result = [{'id': r[0], 'sender_id': r[1], 'text': r[2],
                   'time': r[3].strftime('%H:%M'), 'sender_name': r[4], 'sender_avatar': r[5]}
                  for r in rows]
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result, ensure_ascii=False)}

    # POST ?action=send
    if method == 'POST' and action == 'send':
        body = json.loads(event.get('body') or '{}')
        conv_id = int(body.get('conv_id', 0))
        text = body.get('text', '').strip()
        if not text or not conv_id:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'text and conv_id required'})}
        cur.execute(f"""
            INSERT INTO {SCHEMA}.messages (conversation_id, sender_id, text)
            VALUES (%s, %s, %s) RETURNING id, created_at
        """, (conv_id, user_id, text))
        row = cur.fetchone()
        conn.commit()
        result = {'id': row[0], 'sender_id': user_id, 'text': text, 'time': row[1].strftime('%H:%M')}
        cur.close(); conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': result}

    cur.close(); conn.close()
    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'not found'})}