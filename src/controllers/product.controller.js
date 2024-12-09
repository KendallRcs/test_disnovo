const multer = require('multer');
const xlsx = require('xlsx');

exports.createProduct = async (req, res) => {
  try {
    const { name, brandId, categoryId, marketerId } = req.body;
    const newProduct = await prisma.product.create({
      data: { name, brandId, categoryId, marketerId },
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { brand: true, category: true, marketer: true },
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brandId, categoryId, marketerId } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(marketerId && { marketerId }),
      },
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.importProductsFromExcel = async (req, res) => {
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
        const { Producto, Categoria, Marca, Comercializador } = row;

        //Validar categoria
        let category = await prisma.category.findFirst({
          where: { name: { equals: Categoria, mode: 'insensitive' } },
        });

        if (!category) {
          category = await prisma.category.create({
            data: { name: Categoria },
          });
        }

        //Validarr marca
        let brand = await prisma.brand.findFirst({
          where: { name: { equals: Marca, mode: 'insensitive' } },
        });

        if (!brand) {
          brand = await prisma.brand.create({
            data: { name: Marca },
          });
        }

        //Valuidar comercializador
        let marketer = await prisma.marketer.findFirst({
          where: { name: { equals: Comercializador, mode: 'insensitive' } },
        });

        if (!marketer) {
          marketer = await prisma.marketer.create({
            data: { name: Comercializador },
          });
        }

        //Validar producto
        let product = await prisma.product.findFirst({
          where: { name: { equals: Producto, mode: 'insensitive' } },
        });

        if (!product) {
          // Si el producto no existe, se crea
          product = await prisma.product.create({
            data: {
              name: Producto,
              categoryId: category.id,
              brandId: brand.id,
              marketerId: marketer.id,
            },
          });
        } else if (
          product.categoryId !== category.id ||
          product.brandId !== brand.id ||
          product.marketerId !== marketer.id
        ) {
          //Si existe pero alguno de los valores es distinto, se actualiza
          product = await prisma.product.update({
            where: { id: product.id },
            data: {
              categoryId: category.id,
              brandId: brand.id,
              marketerId: marketer.id,
            },
          });
        }

        results.push({ product, category, brand, marketer });
      }

      res.status(201).json({ message: 'Products imported successfully', results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
