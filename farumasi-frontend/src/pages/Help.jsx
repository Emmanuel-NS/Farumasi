import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Help.css';

const Help = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/home');
  };

  return (
    <div className="help-page">
      {/* Go Back Button */}
      <div className="go-back-container">
        <button onClick={goBack} className="go-back-btn">
          ← Go Back
        </button>
      </div>

      {/* Header */}
      <div className="help-header">
        <h1>Help & Support</h1>
        <p>Find answers to common questions about Farumasi</p>
      </div>

      <div className="help-container">
        {/* Quick Help Cards */}
        <section className="quick-help">
          <h2>Quick Help</h2>
          <div className="help-cards">
            <a href="#delivery-faq" className="help-card">
              <h3>Track Your Order</h3>
              <p>Check the status of your medicine delivery</p>
            </a>
            <a href="#payment-faq" className="help-card">
              <h3>Payment Help</h3>
              <p>Having trouble with Mobile Money payments?</p>
            </a>
            <a href="#ordering-faq" className="help-card">
              <h3>Prescription Orders</h3>
              <p>Learn how to upload and order with prescriptions</p>
            </a>
            <a href="#delivery-faq" className="help-card">
              <h3>Delivery Info</h3>
              <p>Delivery zones, timing, and fees in Kigali</p>
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>

          {/* General FAQ */}
          <div className="faq-category">
            <h3>General Questions</h3>
            <div className="faq-list">
              
              <div className="faq-item">
                <input type="checkbox" id="faq1" className="faq-toggle" />
                <label htmlFor="faq1" className="faq-question">
                  What is Farumasi and how does it work?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>Farumasi is Rwanda's leading online pharmacy delivery service. We connect you with licensed pharmacies in Kigali to deliver medicines directly to your location. Simply browse products, place an order, make payment via Mobile Money, and we'll deliver to your doorstep.</p>
                </div>
              </div>

              <div className="faq-item">
                <input type="checkbox" id="faq2" className="faq-toggle" />
                <label htmlFor="faq2" className="faq-question">
                  Which areas in Kigali do you deliver to?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>We currently deliver to all major districts in Kigali:</p>
                  <ul>
                    <li><strong>Nyarugenge:</strong> City Center, Kimisagara, Rwezamenyo</li>
                    <li><strong>Gasabo:</strong> Remera, Kacyiru, Kimironko, Gisozi</li>
                    <li><strong>Kicukiro:</strong> Gikondo, Niboye, Kicukiro Center</li>
                  </ul>
                  <p>Delivery fees range from 1,000-3,000 RWF depending on distance.</p>
                </div>
              </div>

              <div className="faq-item">
                <input type="checkbox" id="faq3" className="faq-toggle" />
                <label htmlFor="faq3" className="faq-question">
                  How much does delivery cost?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>Delivery fees are calculated based on distance from the pharmacy:</p>
                  <ul>
                    <li>Within 2km: 1,000 RWF</li>
                    <li>2-5km: 2,000 RWF</li>
                    <li>5-10km: 3,000 RWF</li>
                  </ul>
                  <p>Free delivery on orders above 20,000 RWF!</p>
                </div>
              </div>

            </div>
          </div>

          {/* Ordering FAQ */}
          <div className="faq-category" id="ordering-faq">
            <h3>Ordering & Prescriptions</h3>
            <div className="faq-list">
              
              <div className="faq-item">
                <input type="checkbox" id="faq4" className="faq-toggle" />
                <label htmlFor="faq4" className="faq-question">
                  How do I order with a prescription?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>To order with a prescription:</p>
                  <ol>
                    <li>Take a clear photo of your prescription</li>
                    <li>Click "Upload Prescription" on the homepage</li>
                    <li>Upload the image and select your insurance</li>
                    <li>Our pharmacists will review and confirm availability</li>
                    <li>You'll receive a call/SMS with pricing and delivery details</li>
                  </ol>
                  <p><strong>Tip:</strong> Ensure the prescription is clearly readable and includes doctor's signature.</p>
                </div>
              </div>

              <div className="faq-item">
                <input type="checkbox" id="faq5" className="faq-toggle" />
                <label htmlFor="faq5" className="faq-question">
                  Can I order without a prescription?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>Yes! Many over-the-counter medicines are available without prescription including:</p>
                  <ul>
                    <li>Pain relievers (Paracetamol, Ibuprofen)</li>
                    <li>Cold and flu medicines</li>
                    <li>Vitamins and supplements</li>
                    <li>Basic first aid supplies</li>
                  </ul>
                  <p>Simply browse our product catalog and add items to your cart.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Payment FAQ */}
          <div className="faq-category" id="payment-faq">
            <h3>Payment & Mobile Money</h3>
            <div className="faq-list">
              
              <div className="faq-item">
                <input type="checkbox" id="faq7" className="faq-toggle" />
                <label htmlFor="faq7" className="faq-question">
                  What payment methods do you accept?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>We currently accept Mobile Money payments:</p>
                  <ul>
                    <li><strong>MTN Mobile Money</strong> - Pay with your MTN number</li>
                    <li><strong>Airtel Money</strong> - Pay with your Airtel number</li>
                  </ul>
                  <p>Simply enter your phone number at checkout and approve the payment on your phone.</p>
                </div>
              </div>

              <div className="faq-item">
                <input type="checkbox" id="faq8" className="faq-toggle" />
                <label htmlFor="faq8" className="faq-question">
                  My payment failed. What should I do?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>If your payment fails, try these steps:</p>
                  <ol>
                    <li>Check your Mobile Money balance</li>
                    <li>Ensure your phone number is correct</li>
                    <li>Check for SMS payment prompt on your phone</li>
                    <li>Try again with a different payment method</li>
                  </ol>
                  <p>If issues persist, contact our support team at <strong>+250 788 123 456</strong></p>
                </div>
              </div>

            </div>
          </div>

          {/* Delivery FAQ */}
          <div className="faq-category" id="delivery-faq">
            <h3>Delivery & Tracking</h3>
            <div className="faq-list">
              
              <div className="faq-item">
                <input type="checkbox" id="faq9" className="faq-toggle" />
                <label htmlFor="faq9" className="faq-question">
                  How long does delivery take?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>Delivery times depend on your location and order type:</p>
                  <ul>
                    <li><strong>Regular medicines:</strong> 30-60 minutes</li>
                    <li><strong>Prescription orders:</strong> 1-2 hours (including review time)</li>
                    <li><strong>Emergency orders:</strong> 20-30 minutes (additional fee applies)</li>
                  </ul>
                  <p>You can track your order in real-time using our live map feature.</p>
                </div>
              </div>

              <div className="faq-item">
                <input type="checkbox" id="faq10" className="faq-toggle" />
                <label htmlFor="faq10" className="faq-question">
                  Can I track my delivery in real-time?
                  <span className="faq-arrow">▼</span>
                </label>
                <div className="faq-answer">
                  <p>Yes! Once your order is confirmed, you can:</p>
                  <ul>
                    <li>View live delivery tracking on our interactive map</li>
                    <li>See your delivery agent's current location</li>
                    <li>Get estimated arrival time</li>
                    <li>Contact your delivery agent directly</li>
                  </ul>
                  <p>Access tracking from your order confirmation email or user dashboard.</p>
                </div>
              </div>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

export default Help;
