import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai"
import './index.css'

const PRODUCTS = [
  { id: 1, name: 'Exclusive Pink Evening Gown', price: 4500, img: '/high_end_gown_1781710641617.png' },
  { id: 2, name: 'Bespoke Green Tailored Suit', price: 6200, img: '/bespoke_suit_1781710658339.png' },
  { id: 3, name: 'Premium Crystal Stilettos', price: 1850, img: '/premium_shoes_1781710672790.png' },
  { id: 4, name: 'Oversized Pink Knit Top with Cutouts', price: 850, img: '/pink_sweater_1781712649734.png' },
  { id: 5, name: 'Black Faux Leather Puffer Jacket', price: 1200, img: '/black_puffer_1781712662607.png' },
  { id: 6, name: 'Fitted Purple Long Sleeve Dress', price: 950, img: '/purple_dress_1781712675009.png' },
  { id: 7, name: 'Bright Green Tiered Flowy Dress', price: 1100, img: '/green_dress_1781712688661.png' }
];

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', address: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiTextResult, setAiTextResult] = useState('');
  const [aiEstimatedPrice, setAiEstimatedPrice] = useState(0);
  const [currentHeroImg, setCurrentHeroImg] = useState(0);

  const heroImages = [
    "/high_end_gown_1781710641617.png",
    "/bespoke_suit_1781710658339.png",
    "/premium_shoes_1781710672790.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImg((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleRequestQuote = () => {
    addToCart({ 
      id: Date.now(), 
      name: `Custom Design: ${aiPrompt}`, 
      price: aiEstimatedPrice, 
      img: aiResult, 
      isQuote: true 
    });
    setIsCartOpen(true);
  };

  const handleAiGenerate = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setAiResult(null);
    setAiTextResult('');
    setAiEstimatedPrice(0);
    
    // Generate a dynamic image based on the user's prompt using a free image generation endpoint
    // Put the user's prompt FIRST so the AI prioritizes it heavily, and add a random seed to prevent cached/bogus images
    const imagePrompt = `${aiPrompt}, high quality fashion photography, photorealistic, detailed`;
    const randomSeed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=600&height=800&nologo=true&seed=${randomSeed}`;
    
    // Set the image immediately so it starts loading!
    setAiResult(imageUrl);
    
    // Simulate AI text and price generation
    setTimeout(() => {
      setAiTextResult(`An exquisite custom ${aiPrompt.toLowerCase()} designed with premium, high-quality fabrics. This bespoke piece offers a flawless, elegant fit tailored exactly to your unique style, perfect for making a luxurious statement.`);
      
      // Random price between 1500 and 15000 rounded to nearest 100
      const randomPrice = Math.floor(Math.random() * (150 - 15 + 1) + 15) * 100;
      setAiEstimatedPrice(randomPrice);
      
      setIsGenerating(false);
    }, 2000);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);
  const hasQuoteItems = cart.some(item => item.isQuote);

  const handleCheckoutClick = () => {
    setIsCheckout(true);
  };

  const submitOrderWhatsApp = (e) => {
    e.preventDefault();
    const phoneNumber = "27845254565"; // Using country code for SA
    let message = `Hello Patels Xclusive! I would like to place an order for delivery.\n\n`;
    message += `*CUSTOMER DETAILS:*\n`;
    message += `Name: ${customerDetails.name}\n`;
    message += `Phone: ${customerDetails.phone}\n`;
    message += `Address: ${customerDetails.address}\n\n`;
    message += `*ORDER ITEMS:*\n`;
    cart.forEach((item, index) => {
      const priceText = item.isQuote ? (item.price ? `Est. R${item.price}` : 'Quote Requested') : `R${item.price}`;
      message += `${index + 1}. ${item.name} - ${priceText}\n`;
    });
    message += `\n*Total: R${cartTotal}${hasQuoteItems ? ' (plus items pending final quote)' : ''}*\n\nPlease confirm my order!`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handlePayFast = () => {
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
      alert("Please fill in all delivery details before paying online.");
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    // Using PayFast Sandbox URL for testing. For production, use https://www.payfast.co.za/eng/process
    form.action = 'https://sandbox.payfast.co.za/eng/process';
    
    const fields = {
      merchant_id: '10000100', // Sandbox Merchant ID
      merchant_key: '46f0cd694581a', // Sandbox Merchant Key
      return_url: window.location.href,
      cancel_url: window.location.href,
      name_first: customerDetails.name,
      // For simplicity in this demo, we use a placeholder email. You would ideally collect this.
      email_address: 'customer@example.com', 
      cell_number: customerDetails.phone,
      m_payment_id: Date.now().toString(),
      amount: cartTotal.toFixed(2),
      item_name: `Patels Xclusive Order (${cart.length} items)`
    };

    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = fields[key];
        form.appendChild(hiddenField);
      }
    }

    document.body.appendChild(form);
    form.submit();
  };




  return (
    <>
      <nav className="glass-nav">
        <div className="logo">Patels Xclusive</div>
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          🛒 <span>Cart</span>
          {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </button>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1>Elegance, <span>Tailored</span> for You.</h1>
            <p>An exclusive ladies boutique based in Kimberley. We offer full online services and nationwide courier delivery. Discover our premium collection or design your bespoke outfit with our AI Studio.</p>
            <div className="hero-cta">
              <a href="#catalog" className="btn-primary">Explore Collection</a>
              <a href="#ai-studio" className="btn-secondary">Try AI Studio</a>
            </div>
            <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#aaa', fontSize: '1.1rem', animation: 'fadeRight 1s ease-out 0.6s both' }}>
              <span>Follow us on Instagram:</span>
              <a href="https://instagram.com/trendsetters_southafrica" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                @trendsetters_southafrica
              </a>
            </div>
          </div>
          <div className="hero-image-wrapper">
             <div className="hero-image-blur"></div>
             {heroImages.map((img, idx) => (
                <img 
                  key={img}
                  src={img} 
                  alt="Premium Fashion" 
                  className={`hero-image ${idx === currentHeroImg ? 'active' : ''}`} 
                />
             ))}
          </div>
          <div className="scroll-indicator">
            <span>Scroll Down</span>
            <div className="arrow-down"></div>
          </div>
        </section>

        <section id="catalog">
          <h2 className="section-title">Exclusive <span>Collection</span></h2>
          <div className="grid">
            {PRODUCTS.map(product => (
              <div key={product.id} className="product-card glass">
                <img src={product.img} alt={product.name} className="product-img" />
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <div className="product-price">R{product.price}</div>
                  <button className="btn-add" onClick={() => addToCart(product)}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="ai-studio" className="ai-section">
          <div className="glass ai-container">
            <h2 className="section-title" style={{ marginTop: 0 }}>AI Design <span>Studio</span></h2>
            <p style={{ color: '#aaa' }}>Describe your dream outfit and our AI will visualize it instantly.</p>
            <input 
              type="text" 
              className="ai-input" 
              placeholder="e.g. A futuristic metallic evening dress..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button 
              className="btn-generate" 
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt}
            >
              {isGenerating ? 'Designing...' : 'Generate Design'}
            </button>

            {aiResult && (
              <div className="ai-result">
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Your Unique Design</h3>
                {aiTextResult && (
                  <p style={{ fontStyle: 'italic', marginBottom: '1rem', lineHeight: '1.6' }}>"{aiTextResult}"</p>
                )}
                {aiEstimatedPrice > 0 && (
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    Estimated Price: R{aiEstimatedPrice}
                  </div>
                )}
                <img src={aiResult} alt="Generated AI Design" />
                <button 
                  className="btn-add" 
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={handleRequestQuote}
                >
                  Request Final Quote & Pre-order
                </button>
              </div>
            )}
          </div>
        </section>

        <section id="location" style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Visit <span>Our Boutique</span></h2>
          <p style={{ color: '#aaa', marginBottom: '1rem' }}>Experience our exclusive collection in person at our Kimberley location.</p>
          <p style={{ color: 'var(--primary)', fontWeight: 'bold', marginBottom: '2rem' }}>
            Corner Macdougall and Monument Street, Kimberley, South Africa, 8301
          </p>
          <div className="glass" style={{ padding: '1rem', borderRadius: '20px' }}>
            <iframe 
              src="https://www.google.com/maps?q=corner+macdougall+and+monument+street,+Kimberley,+South+Africa,+8301&output=embed" 
              width="100%" 
              height="400" 
              style={{ border: 0, borderRadius: '15px', filter: 'invert(90%) hue-rotate(180deg)' }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Patels Xclusive Location"
            ></iframe>
          </div>
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--glass-border)', marginTop: '2rem', color: '#aaa' }}>
        <p>&copy; {new Date().getFullYear()} Patels Xclusive. All rights reserved.</p>
      </footer>

      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-modal glass ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Your Bag</h3>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>&times;</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', marginTop: '2rem' }}>Your bag is empty.</p>
          ) : isCheckout ? (
            <form onSubmit={submitOrderWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--primary)' }}>Delivery Details</h4>
              <input 
                type="text" 
                placeholder="Full Name" 
                required 
                className="ai-input" 
                style={{ margin: 0 }}
                value={customerDetails.name}
                onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
              />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                required 
                className="ai-input" 
                style={{ margin: 0 }}
                value={customerDetails.phone}
                onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
              />
              <textarea 
                placeholder="Full Delivery Address" 
                required 
                className="ai-input" 
                style={{ margin: 0, minHeight: '80px', fontFamily: 'inherit' }}
                value={customerDetails.address}
                onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})}
              ></textarea>
              <button type="button" onClick={() => setIsCheckout(false)} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}>
                Back to Cart
              </button>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-whatsapp" style={{ flex: 1 }}>
                  Order via WhatsApp
                </button>
                <button 
                  type="button" 
                  onClick={handlePayFast} 
                  style={{ flex: 1, background: '#e3000f', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                  Pay Online (PayFast)
                </button>
              </div>
            </form>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ color: 'var(--primary)' }}>{item.isQuote ? (item.price ? `Est. R${item.price}` : 'Price on Request') : `R${item.price}`}</div>
                </div>
                <button 
                  style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && !isCheckout && (
          <div style={{ marginTop: 'auto' }}>
            <div className="cart-total">
              <span>Total:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: hasQuoteItems ? '1.2rem' : '1.5rem', textAlign: 'right' }}>
                R{cartTotal}
                {hasQuoteItems && <div style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 'normal' }}>+ items pending quote</div>}
              </span>
            </div>
            <button className="btn-whatsapp" onClick={handleCheckoutClick}>
              Proceed to Delivery Details
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default App
