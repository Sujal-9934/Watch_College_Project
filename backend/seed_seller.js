require('dotenv').config();
<<<<<<< HEAD
const { executeQuery } = require('./config/database');

async function seedProducts() {
  try {
    const sellers = await executeQuery("SELECT id FROM users WHERE role = 'seller' LIMIT 1");
    if (sellers.rows.length === 0) {
      console.log('No seller found! Creating a dummy seller...');
      await executeQuery("INSERT INTO users (first_name, last_name, email, password, role) VALUES ('Dummy', 'Seller', 'dummy_seller@test.com', 'hashed', 'seller')");
=======
const { executeQuery, closeConnection } = require('./config/database');

async function seedProducts() {
  try {
    const sellerEmail = process.env.SELLER_EMAIL;
    if (!sellerEmail) {
      throw new Error('Set SELLER_EMAIL to the seller account that will own the seed products.');
    }

    const sellers = await executeQuery(
      "SELECT id FROM users WHERE role = 'seller' AND email = ? LIMIT 1",
      [sellerEmail]
    );
    if (sellers.rows.length === 0) {
      throw new Error(`No seller account found for ${sellerEmail}. Create the account before seeding products.`);
>>>>>>> ffdff2f (Prepare backend for Render deployment)
    }
    
    const sellerRows = await executeQuery("SELECT id FROM users WHERE role = 'seller' LIMIT 1");
    const sellerId = sellerRows.rows[0].id;

    console.log(`Using seller ID: ${sellerId}`);

    const cats = await executeQuery("SELECT id FROM categories");
    const catId1 = cats.rows.length > 0 ? cats.rows[0].id : null;
    const catId2 = cats.rows.length > 1 ? cats.rows[1].id : catId1;

    const brands = await executeQuery("SELECT id FROM brands");
    const brandId1 = brands.rows.length > 0 ? brands.rows[0].id : null;
    const brandId2 = brands.rows.length > 1 ? brands.rows[1].id : brandId1;

    const products = [
      {
        name: 'Omega Speedmaster Professional Moonwatch',
        sku: 'OMG-SPD-002',
        short_description: 'The iconic manual-winding chronograph.',
        description: 'The Moonwatch is one of the world’s most iconic timepieces. Having been a part of all six moon landings, the legendary chronograph is an impressive representation of the brand’s adventurous pioneering spirit.',
        price: 540000,
        original_price: 580000,
        stock_quantity: 8,
        category: catId1,
        brand: brandId1,
        images: ['https://images.unsplash.com/photo-1523170335258-f5edf18eca00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
      },
      {
        name: 'Rolex Submariner Date',
        sku: 'RLX-SUB-002',
        short_description: 'The classic diver watch with a date window.',
        description: 'The Oyster Perpetual Submariner Date in Oystersteel with a Cerachrom bezel insert in black ceramic and a black dial with large luminescent hour markers. It features a unidirectional rotatable bezel and solid-link Oyster bracelet.',
        price: 950000,
        original_price: 980000,
        stock_quantity: 3,
        category: catId2,
        brand: brandId2,
        images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
      },
      {
        name: 'Seiko 5 Sports Automatic Blue Dial',
        sku: 'SEI-5SP-002',
        short_description: 'A reliable and affordable automatic everyday watch.',
        description: 'Building on the legacy of the original Seiko 5, this Sports model features a reliable automatic movement, a durable stainless steel case, and a stunning blue dial protected by Hardlex crystal.',
        price: 25000,
        original_price: 30000,
        stock_quantity: 45,
        category: catId1,
        brand: brandId1,
        images: ['https://images.unsplash.com/photo-1622434641406-a158123450f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
      },
      {
        name: 'Tissot PRX Powermatic 80',
        sku: 'TIS-PRX-002',
        short_description: 'Retro-modern integrated bracelet watch.',
        description: 'Discover the Tissot PRX Powermatic 80, a throwback to a flagship design from 1978. With its integrated case and bracelet design, this watch brings vintage charm with a modern 80-hour power reserve automatic movement.',
        price: 55000,
        original_price: 64000,
        stock_quantity: 20,
        category: catId2,
        brand: brandId2,
        images: ['https://images.unsplash.com/photo-1508656910243-d343dbd23eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
      },
      {
        name: 'Casio G-Shock DW5600',
        sku: 'CAS-GSH-002',
        short_description: 'The tough, classic square G-Shock.',
        description: 'The DW-5600 represents the origin of G-SHOCK, inheriting the design of the first model. It is shock-resistant and 200-meter water-resistant, making it a reliable companion in any situation.',
        price: 9000,
        original_price: 11000,
        stock_quantity: 100,
        category: catId1,
        brand: brandId1,
        images: ['https://images.unsplash.com/photo-1549488344-c1fb67a08e1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80']
      }
    ];

    for (let p of products) {
      // Check SKU first
      const check = await executeQuery('SELECT id FROM products WHERE sku = ?', [p.sku]);
      if (check.rows.length === 0) {
        const discount = p.original_price > p.price ? ((p.original_price - p.price) / p.original_price) * 100 : 0;
        
        const q = `INSERT INTO products (seller_id, name, description, short_description, sku, price, original_price, discount_percentage, stock_quantity, category_id, brand_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;
        const res = await executeQuery(q, [sellerId, p.name, p.description, p.short_description, p.sku, p.price, p.original_price, discount, p.stock_quantity, p.category, p.brand]);
        
        const newId = res.insertId;
        for (let i = 0; i < p.images.length; i++) {
          await executeQuery('INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES (?, ?, ?, ?, ?)', [newId, p.images[i], p.name, i, i === 0 ? 1 : 0]);
        }
        console.log('Inserted: ' + p.name);
      } else {
        console.log('Skipping existing SKU: ' + p.sku);
      }
    }

    console.log('Successfully completed adding 5 products!');
<<<<<<< HEAD
    process.exit(0);
  } catch(e) {
    require('fs').writeFileSync('d:\\sem-6\\projects\\MAjor\\backend\\error.log', String(e.stack || e));
    console.error('Error occurred, check error.log');
    process.exit(1);
=======
  } catch(e) {
    console.error('Failed to seed seller products:', e.message);
    process.exitCode = 1;
  } finally {
    await closeConnection();
>>>>>>> ffdff2f (Prepare backend for Render deployment)
  }
}
seedProducts();
