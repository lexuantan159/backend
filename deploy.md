#update 
sudo -i
sudo apt update -y

#c
sudo apt install postgresql -y

# Create db and table
sudo -i -u postgres
createdb demo
exit

# Connect to create table
sudo -u postgres psql
\c demo

# Create table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 0
);




# Insert Test records
INSERT INTO products (name, price, quantity) VALUES
  ('Laptop', 999.99, 10),
  ('Mouse', 29.99, 50),
  ('Keyboard', 79.99, 30);

# Select all products
SELECT * FROM products;

# Create database and user
sudo -u postgres psql
CREATE USER dbadmin WITH PASSWORD 'demoPassword';
GRANT ALL PRIVILEGES ON DATABASE demo TO dbadmin;
\c demo
GRANT ALL ON SCHEMA public TO dbadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dbadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dbadmin;

# Verify
\l
exit

