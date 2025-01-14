
### users
```
+------------+--------------+------+-----+-------------------+-------------------+
| Field      | Type         | Null | Key | Default           | Extra             |
+------------+--------------+------+-----+-------------------+-------------------+
| user_id    | varchar(512) | NO   | PRI | NULL              |                   |
| name       | varchar(50)  | NO   |     | NULL              |                   |
| email      | varchar(100) | NO   | UNI | NULL              |                   |
| password   | varchar(256) | NO   |     | NULL              |                   |
| created_at | timestamp    | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| role       | varchar(10)  | YES  |     | member            |                   |
+------------+--------------+------+-----+-------------------+-------------------+
```

### categories
+-------------+-------------+------+-----+---------+----------------+
| Field       | Type        | Null | Key | Default | Extra          |
+-------------+-------------+------+-----+---------+----------------+
| category_id | int         | NO   | PRI | NULL    | auto_increment |
| name        | varchar(50) | NO   |     | NULL    |                |
| label       | varchar(50) | YES  |     | NULL    |                |
+-------------+-------------+------+-----+---------+----------------+