
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
```
+-------------+-------------+------+-----+---------+----------------+
| Field       | Type        | Null | Key | Default | Extra          |
+-------------+-------------+------+-----+---------+----------------+
| category_id | int         | NO   | PRI | NULL    | auto_increment |
| name        | varchar(50) | NO   |     | NULL    |                |
| label       | varchar(50) | YES  |     | NULL    |                |
+-------------+-------------+------+-----+---------+----------------+
```

### products
```
+------------------+--------------+------+-----+-------------------+-------------------+
| Field            | Type         | Null | Key | Default           | Extra             |
+------------------+--------------+------+-----+-------------------+-------------------+
| product_id       | varchar(512) | NO   | PRI | NULL              |                   |
| category_id      | int          | YES  | MUL | NULL              |                   |
| name             | varchar(255) | NO   |     | NULL              |                   |
| price            | double       | NO   |     | 0                 |                   |
| stock            | int          | YES  |     | 0                 |                   |
| description      | text         | YES  |     | NULL              |                   |
| is_featured      | tinyint(1)   | YES  |     | 0                 |                   |
| stars            | float        | YES  |     | NULL              |                   |
| sales_percentage | int          | YES  |     | 0                 |                   |
| created_at       | timestamp    | NO   |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+------------------+--------------+------+-----+-------------------+-------------------+
```

### coupons
```
+------------+-------------+------+-----+---------+-------+
| Field      | Type        | Null | Key | Default | Extra |
+------------+-------------+------+-----+---------+-------+
| coupon_id  | varchar(50) | NO   | PRI | NULL    |       |
| discount   | int         | NO   |     | NULL    |       |
| expiration | date        | NO   |     | NULL    |       |
| is_active  | tinyint     | YES  |     | NULL    |       |
+------------+-------------+------+-----+---------+-------+
```