import psycopg2

conn = psycopg2.connect(
    host="localhost",
    database="cms",
    user="postgres",
    password="Y_Aishu@1502",
    port="5432"
)

print("Connected successfully!")