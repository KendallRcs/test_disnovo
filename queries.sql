PREGUNTA 1:

SELECT 
  c.id AS client_id, 
  c.name AS client_name, 
  SUM(s."totalAmount") AS total_spent
FROM 
  public."Sale" s
JOIN 
  public."Client" c ON s."clientId" = c.id
WHERE 
  s.date BETWEEN '2022-01-01' AND '2022-12-31'
GROUP BY 
  c.id, c.name
ORDER BY 
  total_spent DESC
LIMIT 1;

PREGUNTA 2:

SELECT 
  sel.id AS seller_id, 
  sel.name AS seller_name, 
  SUM(s."totalAmount") AS total_sales
FROM 
  public."Sale" s
JOIN 
  public."Local" l ON s."localId" = l.id
JOIN 
  public."Territory" t ON l."territoryId" = t.id
JOIN 
  public."SellerTerritoryAssignment" sta ON t.id = sta."territoryId"
JOIN 
  public."Seller" sel ON sta."sellerId" = sel.id
WHERE 
  s.date BETWEEN '2022-01-01' AND '2022-12-31'
  AND sta."endDate" IS NULL
GROUP BY 
  sel.id, sel.name
ORDER BY 
  total_sales DESC
LIMIT 3;

PREGUNTA 3:

WITH territory_sales AS (
  SELECT 
    t.id AS territory_id, 
    t.name AS territory_name, 
    SUM(s."totalAmount") AS total_sales
  FROM 
    public."Sale" s
  JOIN 
    public."Local" l ON s."localId" = l.id
  JOIN 
    public."Territory" t ON l."territoryId" = t.id
  WHERE 
    s.date BETWEEN '2022-01-01' AND '2022-12-31'
  GROUP BY 
    t.id, t.name
  ORDER BY 
    total_sales ASC
  LIMIT 1
)
SELECT 
  ts.territory_name,
  EXTRACT(MONTH FROM s.date) AS sale_month, 
  SUM(s."totalAmount") AS total_sales
FROM 
  public."Sale" s
JOIN 
  public."Local" l ON s."localId" = l.id
JOIN 
  territory_sales ts ON l."territoryId" = ts.territory_id
GROUP BY 
  ts.territory_name, sale_month
ORDER BY 
  sale_month;


PREGUNTA 4:

SELECT 
  p.id AS product_id, 
  p.name AS product_name, 
  SUM(s.quantity) AS total_sold
FROM 
  public."Sale" s
JOIN 
  public."Product" p ON s."productId" = p.id
WHERE 
  s.date BETWEEN '2022-01-01' AND '2022-12-31'
GROUP BY 
  p.id, p.name
ORDER BY 
  total_sold DESC
LIMIT 1;

PREGUNTA 5:

SELECT 
  l.id AS local_id, 
  l.name AS local_name, 
  c.name AS client_name
FROM 
  public."Local" l
JOIN 
  public."Client" c ON l."clientId" = c.id
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM public."Sale" s
    WHERE s."localId" = l.id
      AND s.date BETWEEN '2022-01-01' AND '2022-12-31'
  );

PREGUNTA 6:

WITH sales_data AS (
  SELECT 
    m.name AS marketer_name, 
    p.id AS product_id, 
    p.name AS product_name, 
    SUM(s."totalAmount") AS total_sales
  FROM 
    public."Sale" s
  JOIN 
    public."Product" p ON s."productId" = p.id
  JOIN 
    public."Category" c ON p."categoryId" = c.id
  JOIN 
    public."Marketer" m ON p."marketerId" = m.id
  WHERE 
    c.name = 'Calderas'
    AND s.date BETWEEN '2022-01-01' AND '2022-12-31'
  GROUP BY 
    m.name, p.id, p.name
)
SELECT 
  sd.product_name, 
  sd.marketer_name, 
  CASE 
    WHEN sd.marketer_name = 'RESASA' THEN sd.total_sales * 1.15 * 0.5
    WHEN sd.marketer_name = 'ACME' THEN sd.total_sales * 0.5
  END AS adjusted_sales
FROM 
  sales_data sd
WHERE 
  sd.marketer_name IN ('RESASA', 'ACME');

PREGUNTA 7:

WITH sales_data AS (
  SELECT 
    m.name AS marketer_name, 
    p.id AS product_id, 
    p.name AS product_name, 
    SUM(s."totalAmount") AS total_sales, 
    SUM(s.quantity) AS total_quantity
  FROM 
    public."Sale" s
  JOIN 
    public."Product" p ON s."productId" = p.id
  JOIN 
    public."Category" c ON p."categoryId" = c.id
  JOIN 
    public."Marketer" m ON p."marketerId" = m.id
  WHERE 
    c.name = 'Calderas'
    AND s.date BETWEEN '2022-01-01' AND '2022-12-31'
  GROUP BY 
    m.name, p.id, p.name
)
SELECT 
  sd.product_name, 
  sd.marketer_name, 
  CASE 
    WHEN sd.marketer_name = 'RESASA' THEN (sd.total_sales * 1.2) / sd.total_quantity
    ELSE sd.total_sales / sd.total_quantity
  END AS adjusted_avg_price
FROM 
  sales_data sd
WHERE 
  sd.marketer_name IN ('RESASA', 'ACME');