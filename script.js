let priceList = {};
let allTlds = [];

const premiumTlds = ["gg", "io"];

// Load price list ONCE
fetch("pricelist.json")
  .then(res => res.json())
  .then(data => {
    priceList = data.prices;
    allTlds = Object.keys(priceList);

    loadFeaturedPrices(); // run after data loads
  });

// ✅ Correct price function
function calculatePrice(tld, basePrice) {
  if (!basePrice) basePrice = 4;

  let finalPrice = basePrice;

  // subtract $1 for premium TLDs
  if (premiumTlds.includes(tld)) {
    finalPrice -= 1;
  }

  return finalPrice.toFixed(2);
}

async function searchDomain() {
  const input = document.getElementById("domainInput").value.trim().toLowerCase();
  const resultsDiv = document.getElementById("results");

  if (!input) return;

  resultsDiv.innerHTML = "Loading...";

  const hasTld = input.includes(".");

  if (hasTld) {
    let parts = input.split(".");
    let tld = parts.slice(1).join(".");

    let available = await checkAvailability(input);

    let basePrice = priceList[tld];
    let price = calculatePrice(tld, basePrice);

    resultsDiv.innerHTML = `
      <div class="domain">
        <strong>${input}</strong><br/><br/>
        <span class="${available ? "available" : "taken"}">
          ${available ? "Available" : "Taken"}
        </span><br/><br/>
        <strong>$${price}</strong>
      </div>
    `;
  } else {
    let sortedTlds = allTlds
      .sort((a, b) => (priceList[a] || 999) - (priceList[b] || 999))
      .slice(0, 50);

    let promises = sortedTlds.map(async (tld) => {
      let domain = `${input}.${tld}`;
      let available = await checkAvailability(domain);

      let basePrice = priceList[tld];
      let price = calculatePrice(tld, basePrice);

      return `
        <div class="domain">
          <strong>${domain}</strong><br/><br/>
          <span class="${available ? "available" : "taken"}">
            ${available ? "Available" : "Taken"}
          </span><br/><br/>
          <strong>$${price}</strong>
        </div>
      `;
    });

    let results = await Promise.all(promises);
    resultsDiv.innerHTML = results.join("");
  }
}

async function checkAvailability(domain) {
  try {
    let res = await fetch(`https://rdap.org/domain/${domain}`);
    return res.status !== 200;
  } catch {
    return true;
  }
}

// Featured prices
function loadFeaturedPrices() {
  const tlds = ["com", "gg", "io", "cc", "xyz"];

  tlds.forEach(tld => {
    let basePrice = priceList[tld];
    let price = calculatePrice(tld, basePrice);

    let el = document.getElementById(`price-${tld}`);
    if (el) el.innerText = `$${price}/yr`;
  });
}

// Quick search
function quickSearch(tld) {
  const input = document.getElementById("domainInput").value.trim();

  if (!input) {
    alert("Enter a domain name first");
    return;
  }

  document.getElementById("domainInput").value = `${input}.${tld}`;
  searchDomain();
}

// Menu toggle
function toggleMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById("dropdown");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// Close menu on outside click
document.addEventListener("click", function () {
  document.getElementById("dropdown").style.display = "none";
});
