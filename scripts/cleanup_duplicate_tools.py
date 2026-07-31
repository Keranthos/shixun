#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Remove duplicate / test tool rows and related records."""

import sys

import pymysql

DELETE_IDS = (159, 166, 167, 191, 192)
KEEP_MAP = {
    159: 155,  # Figma
    166: 158,  # ChatGPT
    167: 152,  # GitHub Copilot
}


def cleanup(user='root', password='', host='127.0.0.1', database='softeng'):
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4',
        autocommit=False,
    )
    try:
        with conn.cursor() as c:
            c.execute(
                "SELECT resource_id, resource_name FROM tools WHERE resource_id IN %s ORDER BY resource_id",
                (DELETE_IDS,),
            )
            rows = c.fetchall()
            if not rows:
                print("No duplicate tools to delete.")
                conn.commit()
                return

            print("Will delete tools:")
            for rid, name in rows:
                print(f"  [{rid}] {name}")

            for table, col in (
                ("comment_likes", "comment_id"),
                ("comments", "resource_id"),
                ("collections", "resource_id"),
                ("tool_tags", "tool_id"),
                ("tool_images", "tool_id"),
                ("tool_contributors", "tool_id"),
            ):
                if table == "comments":
                    c.execute(
                        f"DELETE FROM {table} WHERE resource_type='tool' AND {col} IN %s",
                        (DELETE_IDS,),
                    )
                elif table == "collections":
                    c.execute(
                        f"DELETE FROM {table} WHERE resource_type='tool' AND {col} IN %s",
                        (DELETE_IDS,),
                    )
                elif table == "comment_likes":
                    c.execute(
                        f"""DELETE cl FROM comment_likes cl
                            INNER JOIN comments cm ON cl.comment_id = cm.comment_id
                            WHERE cm.resource_type='tool' AND cm.resource_id IN %s""",
                        (DELETE_IDS,),
                    )
                else:
                    c.execute(f"DELETE FROM {table} WHERE {col} IN %s", (DELETE_IDS,))

            c.execute("DELETE FROM tools WHERE resource_id IN %s", (DELETE_IDS,))

            for dup_id, keep_id in KEEP_MAP.items():
                c.execute(
                    """UPDATE tools SET collections = (
                         SELECT COUNT(*) FROM collections
                         WHERE resource_type='tool' AND resource_id = %s
                       ) WHERE resource_id = %s""",
                    (keep_id, keep_id),
                )

            c.execute("SELECT COUNT(*) FROM tools")
            remaining = c.fetchone()[0]
            print(f"Done. tools remaining: {remaining}")

        conn.commit()
        print("Cleanup committed.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    user = sys.argv[1] if len(sys.argv) > 1 else "root"
    password = sys.argv[2] if len(sys.argv) > 2 else ""
    host = sys.argv[3] if len(sys.argv) > 3 else "127.0.0.1"
    database = sys.argv[4] if len(sys.argv) > 4 else "softeng"
    cleanup(user, password, host, database)
