const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

app.use('/products', require('./routes/product.routes'));
app.use('/sales', require('./routes/sale.routes'));
app.use('/clients', require('./routes/client.routes'));
app.use('/brands', require('./routes/brand.routes'));
app.use('/categories', require('./routes/category.routes'));
app.use('/locals', require('./routes/local.routes'));
app.use('/sellers', require('./routes/seller.routes'));
app.use('/territories', require('./routes/territory.routes'));
app.use('/marketers', require('./routes/marketer.routes'));
app.use('/segments', require('./routes/segment.routes'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test Disnovo backend running on port ${PORT}`));
