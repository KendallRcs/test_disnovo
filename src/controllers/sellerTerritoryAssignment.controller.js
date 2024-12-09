const multer = require('multer');
const xlsx = require('xlsx');

exports.createAssignment = async (req, res) => {
  try {
    const { sellerId, territoryId, startDate, endDate } = req.body;
    const newAssignment = await prisma.sellerTerritoryAssignment.create({
      data: { sellerId, territoryId, startDate, endDate },
    });
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await prisma.sellerTerritoryAssignment.findMany({
      where: { deletedAt: null },
      include: {
        seller: true,
        territory: true,
      },
    });
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { sellerId, territoryId, startDate, endDate } = req.body;

    const updatedAssignment = await prisma.sellerTerritoryAssignment.update({
      where: { id: parseInt(id) },
      data: {
        ...(sellerId && { sellerId }),
        ...(territoryId && { territoryId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });
    res.status(200).json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sellerTerritoryAssignment.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const upload = multer({ storage: multer.memoryStorage() }).single('file');

exports.importAllFromExcel = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error uploading file' });
    }

    try {
      // Leyendo el archivo Excel
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

      const results = {};

      // Procesar Vendedores (Hoja 1)
      const sellersSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sellersData = xlsx.utils.sheet_to_json(sellersSheet);
      results.sellers = [];
      for (const row of sellersData) {
        const { Vendedor, Territorio } = row;

        // Validar vendedor
        let seller = await prisma.seller.findFirst({
          where: { name: { equals: Vendedor, mode: 'insensitive' } },
        });

        if (!seller) {
          seller = await prisma.seller.create({ data: { name: Vendedor } });
        }

        // Procesar territorios
        const territories = Territorio.split(/y|,/).map((t) => t.trim());
        for (const territoryName of territories) {
          let territory = await prisma.territory.findFirst({
            where: { name: { equals: territoryName, mode: 'insensitive' } },
          });

          if (!territory) {
            territory = await prisma.territory.create({ data: { name: territoryName } });
          }

          //Validar si el territorio está asignado al vendedor de la fila
          const existingAssignmentForSeller = await prisma.sellerTerritoryAssignment.findFirst({
            where: {
              sellerId: seller.id,
              territoryId: territory.id,
              endDate: null,
            },
          });

          if (!existingAssignmentForSeller) {
            //Validar si el territorio está asignado a otro vendedor
            const existingAssignmentForAnotherSeller = await prisma.sellerTerritoryAssignment.findFirst({
              where: {
                territoryId: territory.id,
                endDate: null,
              },
            });

            //Si está asignado a otro vendedor, actualizar el endDate del vendedor anterior
            if (existingAssignmentForAnotherSeller) {
              await prisma.sellerTerritoryAssignment.update({
                where: { id: existingAssignmentForAnotherSeller.id },
                data: { endDate: new Date() },
              });
            }

            //Asignar el territorio al vendedor actual
            await prisma.sellerTerritoryAssignment.create({
              data: {
                sellerId: seller.id,
                territoryId: territory.id,
                startDate: new Date(),
              },
            });
          }
        }

        results.sellers.push({ seller, territories });
      }

      // Procesar Clientes (Hoja 2)
      const clientsSheet = workbook.Sheets[workbook.SheetNames[1]];
      const clientsData = xlsx.utils.sheet_to_json(clientsSheet);
      results.clients = [];
      for (const row of clientsData) {
        const { Cliente, Segmento } = row;

        // Validar segmento
        let segment = await prisma.segment.findFirst({
          where: { name: { equals: Segmento, mode: 'insensitive' } },
        });

        if (!segment) {
          segment = await prisma.segment.create({ data: { name: Segmento } });
        }

        // Validar cliente
        let client = await prisma.client.findFirst({
          where: { name: { equals: Cliente, mode: 'insensitive' } },
        });

        if (!client) {
          client = await prisma.client.create({
            data: { name: Cliente, segmentId: segment.id },
          });
        } else if (client.segmentId !== segment.id) {
          client = await prisma.client.update({
            where: { id: client.id },
            data: { segmentId: segment.id },
          });
        }

        results.clients.push({ client, segment });
      }

      // Procesar Locales (Hoja 3)
      const localsSheet = workbook.Sheets[workbook.SheetNames[2]];
      const localsData = xlsx.utils.sheet_to_json(localsSheet);
      results.locals = [];
      for (const row of localsData) {
        const { Local, Cliente, Territorio } = row;

        // Validar cliente
        let client = await prisma.client.findFirst({
          where: { name: { equals: Cliente, mode: 'insensitive' } },
        });

        if (!client) {
          client = await prisma.client.create({ data: { name: Cliente } });
        }

        // Validar territorio
        let territory = await prisma.territory.findFirst({
          where: { name: { equals: Territorio, mode: 'insensitive' } },
        });

        if (!territory) {
          territory = await prisma.territory.create({ data: { name: Territorio } });
        }

        // Validar local
        let local = await prisma.local.findFirst({
          where: { name: { equals: Local, mode: 'insensitive' } },
        });

        if (!local) {
          local = await prisma.local.create({
            data: { name: Local, clientId: client.id, territoryId: territory.id },
          });
        } else if (
          local.clientId !== client.id ||
          local.territoryId !== territory.id
        ) {
          local = await prisma.local.update({
            where: { id: local.id },
            data: { clientId: client.id, territoryId: territory.id },
          });
        }

        results.locals.push({ local, client, territory });
      }

      // Procesar Productos (Hoja 4)
      const productsSheet = workbook.Sheets[workbook.SheetNames[3]];
      const productsData = xlsx.utils.sheet_to_json(productsSheet);
      results.products = [];
      for (const row of productsData) {
        const { Producto, Categoria, Marca, Comercializador } = row;

        // Validar categoría
        let category = await prisma.category.findFirst({
          where: { name: { equals: Categoria, mode: 'insensitive' } },
        });

        if (!category) {
          category = await prisma.category.create({ data: { name: Categoria } });
        }

        // Validar marca
        let brand = await prisma.brand.findFirst({
          where: { name: { equals: Marca, mode: 'insensitive' } },
        });

        if (!brand) {
          brand = await prisma.brand.create({ data: { name: Marca } });
        }

        // Validar comercializador
        let marketer = await prisma.marketer.findFirst({
          where: { name: { equals: Comercializador, mode: 'insensitive' } },
        });

        if (!marketer) {
          marketer = await prisma.marketer.create({ data: { name: Comercializador } });
        }

        // Validar producto
        let product = await prisma.product.findFirst({
          where: { name: { equals: Producto, mode: 'insensitive' } },
        });

        if (!product) {
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
          product = await prisma.product.update({
            where: { id: product.id },
            data: {
              categoryId: category.id,
              brandId: brand.id,
              marketerId: marketer.id,
            },
          });
        }

        results.products.push({ product, category, brand, marketer });
      }

      // Procesar Ventas (Hoja 5)
      const salesSheet = workbook.Sheets[workbook.SheetNames[4]];
      const salesData = xlsx.utils.sheet_to_json(salesSheet);
      results.sales = [];
      for (const row of salesData) {
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

        results.sales.push({ sale, product, brand, client, local });
      }

      res.status(201).json({ message: 'All entities imported successfully', results });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
