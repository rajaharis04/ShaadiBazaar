-- ============================================================
-- SHAADI BAZAAR — SEED DATA (CONCISE)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Clear existing products and services first
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.services CASCADE;

-- ============================================================
-- INSERT PRODUCTS (10 per category)
-- ============================================================
INSERT INTO public.products (name, description, price, category, image_url, stock, is_featured) VALUES

-- BRIDAL (10)
('Royal Bridal Lehenga', 'Embroidered red and gold wedding lehenga.', 85000, 'bridal', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', 5, true),
('Heritage Maroon Dress', 'Traditional deep maroon embroidered bridal wear.', 120000, 'bridal', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600', 3, true),
('Ivory Nikkah Gharara', 'Elegant white gharara with silver work.', 45000, 'bridal', 'https://images.unsplash.com/photo-1594938298603-c8148c4b4d21?w=600', 8, false),
('Green Velvet Lehenga', 'Forest green velvet lehenga with golden embroidery.', 65000, 'bridal', 'https://images.unsplash.com/photo-1617627143233-5b3ef0eb5c50?w=600', 6, false),
('Mehndi Mustard Kurta', 'Mustard yellow outfit with light mirror work.', 25000, 'bridal', 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=600', 10, false),
('Valima Silk Saree', 'Pure silk rose pink valima saree.', 35000, 'bridal', 'https://images.unsplash.com/photo-1585914924626-15adac1e6402?w=600', 7, false),
('Royal Blue Sharara', 'Navy blue embroidered bridal sharara set.', 55000, 'bridal', 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=600', 4, true),
('Peacock Anarkali Gown', 'Peacock green gown with gold borders.', 38000, 'bridal', 'https://images.unsplash.com/photo-1614361702-9d177ad30a62?w=600', 9, false),
('Barat Crimson Maxy', 'Heavy dabka work bridal maxi dress.', 95000, 'bridal', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 2, false),
('Pastel Peach Nikah Dress', 'Soft peach nikah outfit with light embroidery.', 18000, 'bridal', 'https://images.unsplash.com/photo-1617627143233-5b3ef0eb5c50?w=600', 12, false),

-- JEWELLERY (10)
('Kundan Necklace Set', 'Bridal kundan necklace with jhumkas.', 45000, 'jewellery', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', 8, true),
('Polki Diamond Choker', 'Polki diamond choker set with jhumkas.', 180000, 'jewellery', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 2, true),
('Gold Jhumka Earrings', '22k gold plated ruby drop jhumkas.', 32000, 'jewellery', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', 15, false),
('Silver Oxidized Bangles', 'Oxidized silver bangles set of 12.', 8500, 'jewellery', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600', 20, false),
('Emerald Pendant Set', 'Gold pendant necklace with natural emerald.', 75000, 'jewellery', 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600', 5, false),
('Pearl Maang Tikka', 'Elegant gold maang tikka with pearl drops.', 12000, 'jewellery', 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600', 18, false),
('Traditional Bridal Nath', 'Kundan nose ring with pearl strings.', 15000, 'jewellery', 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600', 10, false),
('Bridal Haath Phool', 'Gold plated hand jewelry set.', 9500, 'jewellery', 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600', 12, true),
('Ruby Choker Necklace', 'Red ruby choker with matching earrings.', 55000, 'jewellery', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600', 6, false),
('Mughal Kada Bangles', 'Antique gold kada bangles with enamel.', 28000, 'jewellery', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', 8, false),

-- MEHNDI (10)
('Henna Cones Premium Pack', 'Pack of 12 natural mehndi cones.', 1500, 'mehndi', 'https://images.unsplash.com/photo-1591113535750-a37f12de0b5e?w=600', 100, false),
('Mehndi Design Book', 'Traditional Arabic and Pakistani designs book.', 850, 'mehndi', 'https://images.unsplash.com/photo-1535450773485-f3b3ad4a9966?w=600', 50, false),
('Glitter Henna Kit', 'Mehndi kit with glitter colors and stencils.', 2500, 'mehndi', 'https://images.unsplash.com/photo-1591113535750-a37f12de0b5e?w=600', 35, false),
('Henna Paste Bottle', 'Ready-to-use mehndi paste in squeeze bottle.', 600, 'mehndi', 'https://images.unsplash.com/photo-1535450773485-f3b3ad4a9966?w=600', 80, false),
('Mehndi Decoration Thaali', 'Decorated thaal with flowers and candles.', 3500, 'mehndi', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', 25, true),
('Pure Henna Powder', '250g organic natural henna powder.', 450, 'mehndi', 'https://images.unsplash.com/photo-1591113535750-a37f12de0b5e?w=600', 200, false),
('Mehndi Stage Props Kit', 'Decor props including mini dhols and mirrors.', 8500, 'mehndi', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600', 15, false),
('Mehndi Stencils Pack', 'Pack of 20 reusable mehndi stencils.', 1200, 'mehndi', 'https://images.unsplash.com/photo-1535450773485-f3b3ad4a9966?w=600', 40, false),
('Mehndi Welcome Board', 'Custom welcome board with fairy lights.', 2800, 'mehndi', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600', 30, false),
('Henna Color Enhancing Oil', 'Oil to darken mehndi stain.', 950, 'mehndi', 'https://images.unsplash.com/photo-1591113535750-a37f12de0b5e?w=600', 60, false),

-- DECOR (10)
('Red & Gold Floral Wall', 'Faux rose backdrop panel for stage.', 25000, 'decor', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 10, true),
('Crystal Centerpiece Vases', 'Set of 5 crystal table vases.', 15000, 'decor', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 8, false),
('Fairy Light Curtain', '3x3m warm white LED curtain.', 4500, 'decor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 30, false),
('Royal Wedding Stage Sofa', 'Carved white and gold stage sofa.', 85000, 'decor', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 3, true),
('Rose Garlands Pack', 'Pack of 10 artificial rose garlands.', 3500, 'decor', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 50, false),
('Flower Gate Arch Frame', 'Arch frame for wedding entrance gate.', 18000, 'decor', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 7, false),
('Five-Arm Candelabra', 'Tall gold plated metal candelabra.', 12000, 'decor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 12, false),
('Hanging Floral Chandelier', 'Ceiling floral decoration ring.', 8500, 'decor', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 20, false),
('Photo Booth Props', '50-piece funny photo backdrop props.', 5500, 'decor', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600', 25, false),
('Balloons Garland Kit', '200 gold and white balloons set.', 3800, 'decor', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 35, false),

-- BARAAT (10)
('Royal Blue Sherwani', 'Groom sherwani with embroidery.', 45000, 'baraat', 'https://images.unsplash.com/photo-1612470342989-e7d490df8b99?w=600', 6, true),
('Ivory Nikkah Sherwani', 'Plain raw silk groom sherwani.', 38000, 'baraat', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', 8, false),
('Bridal Doli Decor', 'Arrival doli carriage decoration kit.', 55000, 'baraat', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 2, false),
('Embroidered Groom Khussa', 'Traditional golden groom shoes.', 8500, 'baraat', 'https://images.unsplash.com/photo-1612470342989-e7d490df8b99?w=600', 20, false),
('Baraat Car Decor Kit', 'Decor kit for groom carriage car.', 12000, 'baraat', 'https://images.unsplash.com/photo-1607892006136-5bf78e3e21c2?w=600', 15, true),
('Groom Floral Sehra', 'Fresh roses sehra crown.', 5500, 'baraat', 'https://images.unsplash.com/photo-1612470342989-e7d490df8b99?w=600', 25, false),
('Maroon Silk Pagri', 'Pre-tied maroon silk groom turban.', 4500, 'baraat', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', 18, false),
('Baraat Band Outfits', 'Dhol player fancy outfits set.', 8000, 'baraat', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 10, false),
('Sherwani Kalgi Brooch', 'Kundan brooch with pearl drop.', 3500, 'baraat', 'https://images.unsplash.com/photo-1612470342989-e7d490df8b99?w=600', 30, false),
('Golden Groom Dupatta', 'Gold tissue shawl for groom.', 6500, 'baraat', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600', 22, false);

-- ============================================================
-- INSERT SERVICES (10 per category)
-- ============================================================
INSERT INTO public.services (title, provider_name, category, city, price_per_day, description, image_url, rating) VALUES

-- PHOTOGRAPHER (10)
('Royal Moments Photography', 'Ahmed Raza Studios', 'photographer', 'Karachi', 45000, 'Cinematic photography and video.', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600', 4.9),
('Shaadi Clicks Premium', 'Bilal Ahmed Photography', 'photographer', 'Lahore', 38000, 'Candid photos and drone footage.', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600', 4.8),
('Dream Wedding Films', 'Hassan Ali Visuals', 'photographer', 'Islamabad', 52000, 'Premium 4K wedding videography.', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600', 4.9),
('Elegant Female Team', 'Sara Khan Photo', 'photographer', 'Karachi', 32000, 'All-female photography crew.', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600', 4.7),
('Golden Hour Shoot', 'Usman Malik Photo', 'photographer', 'Lahore', 42000, 'Outdoor sunset portrait specialists.', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600', 4.8),
('Timeless Portraits', 'Zara Hussain Studio', 'photographer', 'Multan', 28000, 'Traditional portraits with album print.', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600', 4.6),
('Capital Cinematic Films', 'Imran Sheikh Films', 'photographer', 'Islamabad', 48000, 'Modern cinematic edit wedding video.', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600', 4.8),
('Mehndi Event coverage', 'Fatima Studios', 'photographer', 'Karachi', 25000, 'Specialized mehndi event photos.', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600', 4.5),
('Budget wedding clicks', 'Ali Hassan Photo', 'photographer', 'Faisalabad', 22000, 'Affordable wedding packages.', 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600', 4.4),
('Luxury Wedding Film', 'Omar Farooq Films', 'photographer', 'Lahore', 65000, 'Bollywood style cinematic movie.', 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600', 5.0),

-- DECORATOR (10)
('Floral Decor Farid', 'Farid Events', 'decorator', 'Karachi', 150000, 'Premium fresh floral stages.', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 4.9),
('Dream Stage Theme', 'Mehnaz Decor', 'decorator', 'Lahore', 120000, 'Mughal and modern theme stages.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 4.8),
('Islamabad Lawn Decor', 'Bloom Events', 'decorator', 'Islamabad', 95000, 'Fresh flower garden setup.', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 4.7),
('Grand Hall Decor', 'Splendor Events', 'decorator', 'Karachi', 200000, 'Heavy decoration for large halls.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 4.9),
('Rang De Mehndi Stage', 'Mehndi Decor House', 'decorator', 'Lahore', 65000, 'Vibrant mehndi stages and swings.', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 4.6),
('Lawn Wedding Tents', 'Garden Bliss', 'decorator', 'Islamabad', 110000, 'Complete outdoor setup with tents.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 4.7),
('Traditional Multan Decor', 'Shan Events', 'decorator', 'Multan', 55000, 'Jasmine and marigold wedding decor.', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 4.5),
('Modern LED Backdrop', 'Glow Weddings', 'decorator', 'Karachi', 175000, 'Digital screens and floral designs.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 4.8),
('Intimate Home Decor', 'Small Wonders Decor', 'decorator', 'Lahore', 35000, 'Simple dholki setups at home.', 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', 4.5),
('Mughal Theme Decor', 'Heritage Events', 'decorator', 'Islamabad', 150000, 'Royal theme wedding setup.', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600', 4.9),

-- CATERING (10)
('Royal Feast Catering', 'Chef Tariq Kitchen', 'catering', 'Karachi', 2500, 'High-end desi wedding menus.', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600', 4.9),
('Desi Lahori Catering', 'Lahore Food Co', 'catering', 'Lahore', 1800, 'Authentic Lahori karahi and naan.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', 4.8),
('Continental Buffet', 'Fusion Feast', 'catering', 'Islamabad', 3200, 'Desi and Chinese combination.', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600', 4.7),
('Karachi Biryani House', 'Dum Pukht Catering', 'catering', 'Karachi', 1500, 'Special beef and mutton biryani.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', 4.6),
('Live BBQ Station', 'Charcoal Grill', 'catering', 'Lahore', 2200, 'Live tikka, kabab, and sajji.', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600', 4.8),
('Multan Traditional Dawat', 'Sajji Masters', 'catering', 'Multan', 1200, 'Authentic sajji and mutton roast.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', 4.5),
('Sweet Tooth Station', 'Sweet Dreams', 'catering', 'Karachi', 800, 'Kheer, gulab jamun, and cake bars.', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600', 4.7),
('High Tea Service', 'Elegance Tea', 'catering', 'Islamabad', 1500, 'Nikah event high tea buffet.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', 4.6),
('Full Service Buffet', 'Faisalabad Caterers', 'catering', 'Faisalabad', 1800, 'Food with complete table service.', 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600', 4.5),
('Wedding BBQ Buffet', 'Rawalpindi Grill', 'catering', 'Rawalpindi', 2000, 'Barbecue food for valima.', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600', 4.4);
