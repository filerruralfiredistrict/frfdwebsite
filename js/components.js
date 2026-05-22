// Injects shared header and footer into every page
const HEADER_HTML = `
<header>
  <div class="container nav-inner">
    <a class="nav-brand" href="/index.html">
      <img src="/assets/images/logo.png" alt="Filer Rural Fire District logo">
      <div class="nav-brand-text">
        <span class="brand-main">Filer Rural Fire District</span>
        <span class="brand-sub">Station 26 &mdash; Filer, Idaho</span>
      </div>
    </a>
    <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/index.html">Home</a></li>
        <li><a href="/history.html">History</a></li>
        <li class="nav-dropdown">
          <a href="/governance.html">Governance</a>
          <ul class="dropdown-menu">
            <li><a href="/governance.html#board-members">Board Members</a></li>
            <li><a href="/governance.html#board-meetings">Board Meetings</a></li>
            <li><a href="/governance.html#staff">Staff</a></li>
            <li><a href="/governance.html#transparency">Transparency</a></li>
          </ul>
        </li>
        <li class="nav-dropdown">
          <a href="/services.html">Services</a>
          <ul class="dropdown-menu">
            <li><a href="/services.html#services-list">What We Do</a></li>
            <li><a href="/services.html#faqs">FAQs</a></li>
            <li><a href="/services.html#burn-permits">Burn Permits</a></li>
          </ul>
        </li>
        <li><a href="/news.html">Updates</a></li>
        <li><a href="/contact.html">Contact Us</a></li>
        <li><a href="/volunteer.html" class="btn btn-primary" style="padding:.4rem 1rem;font-size:.85rem;">Volunteer</a></li>
      </ul>
    </nav>
  </div>
</header>`;

const FOOTER_HTML = `
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <img src="/assets/images/logo.png" alt="Filer Rural Fire District">
          <div class="footer-brand-text">
            <strong style="color:#fff;font-size:1rem;">Filer Rural Fire District</strong>
            <p>Serving the Filer community since 1928.<br>Station 26 &mdash; Filer, Idaho.</p>
          </div>
        </div>
      </div>
      <div>
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/history.html">History</a></li>
          <li><a href="/governance.html">Governance</a></li>
          <li><a href="/services.html">Services</a></li>
          <li><a href="/news.html">Updates</a></li>
          <li><a href="/contact.html">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul>
          <li style="color:var(--gray);font-size:.875rem;">100 US-30</li>
          <li style="color:var(--gray);font-size:.875rem;">Filer, ID 83328</li>
          <li style="margin-top:.5rem;"><a href="tel:+12083264111">(208) 326-4111</a></li>
          <li><a href="/contact.html">Send a Message</a></li>
          <li style="margin-top:.5rem;"><a href="/volunteer.html">Join Our Team</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; ${new Date().getFullYear()} Filer Rural Fire District. All rights reserved.</span>
      <span>
        <a href="/privacy.html">Privacy Policy</a> &middot;
        <a href="/transparency.html">Transparency Report</a> &middot;
        <a href="/accessibility.html">Accessibility</a>
      </span>
      <span>Website by <a href="https://beepfix.com" target="_blank" rel="noopener">BeepFix.com</a></span>
    </div>
  </div>
</footer>`;

document.addEventListener('DOMContentLoaded', () => {
  const headerPlaceholder = document.getElementById('site-header');
  const footerPlaceholder = document.getElementById('site-footer');
  if (headerPlaceholder) headerPlaceholder.outerHTML = HEADER_HTML;
  if (footerPlaceholder) footerPlaceholder.outerHTML = FOOTER_HTML;
});
