const multer = require('multer');
const xlsx = require('xlsx');

exports.createSale = async (req, res) => {
  try {
    const { date, productId, brandId, clientId, localId, price, quantity, totalAmount } = req.body;
    const newSale = await prisma.sale.create({
      data: { date, productId, brandId, clientId, localId, price, quantity, totalAmount },
    });
    res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { deletedAt: null },
      include: { product: true, brand: true, client: true, local: true},
    });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, productId, brandId, clientId, localId, price, quantity, totalAmount } = req.body;

    const updatedSale = await prisma.sale.update({
      where: { id: parseInt(id) },
      data: {
        ...(date && { date }),
        ...(productId && { productId }),
        ...(brandId && { brandId }),
        ...(clientId && { clientId }),
        ...(localId && { localId }),
        ...(price && { price }),
        ...(quantity && { quantity }),
        ...(totalAmount && { totalAmount }),
      },
    });
    res.status(200).json(updatedSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sale.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.importSalesFromExcel = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error uploading file' });
    }

    try {
      //Leyendo archivo Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = xlsx.utils.sheet_to_json(sheet);

      const results = [];
      for (const row of data) {
        const { Fecha, Producto, Marca, Cliente, Local, 'Precio (USD)': Precio, Cantidad, 'Monto (USD)': Monto } = row;

        //Validar cliente
        let client = await prisma.client.findFirst({
          where: { name: { equals: Cliente, mode: 'insensitive' } },
        });

        if (!client) {
          client = await prisma.client.create({
            data: { name: Cliente },
          });
        }

        //Validar local
        let local = await prisma.local.findFirst({
          where: { name: { equals: Local, mode: 'insensitive' } },
        });

        if (!local) {
          local = await prisma.local.create({
            data: { name: Local, clientId: client.id, territoryId: 1 },
          });
        }

        //Validar marca
        let brand = await prisma.brand.findFirst({
          where: { name: { equals: Marca, mode: 'insensitive' } },
        });

        if (!brand) {
          brand = await prisma.brand.create({
            data: { name: Marca },
          });
        }

        //Validar producto
        let product = await prisma.product.findFirst({
          where: { name: { equals: Producto, mode: 'insensitive' } },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              name: Producto,
              brandId: brand.id,
            },
          });
        }

        // Crear el registro de venta
        const sale = await prisma.sale.create({
          data: {
            date: new Date(Fecha),
            productId: product.id,
            brandId: brand.id,
            clientId: client.id,
            localId: local.id,
            price: Precio,
            quantity: Cantidad,
            totalAmount: Monto,
          },
        });

        results.push({ sale, product, brand, client, local });
      }

      res.status(201).json({ message: 'Sales imported successfully', results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
