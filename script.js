let allTlds = [];

const priceList = {
  com: 7,
  net: 6,
  xyz: 1,
  gg: 5
};

const premiumTlds = ["gg", "io"];

function calculatePrice(tld) {
  let basePrice = priceList[tld] ?? 4;

  // subtract $1 for premium TLDs
  if (premiumTlds.includes(tld)) {
    basePrice -= 1;
  }

  return basePrice.toFixed(2);
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
    let price = calculatePrice(tld);

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
    let sortedTlds = Object.keys(priceList)
      .concat(["org", "app", "dev", "me", "co", "site", "online", "store"])
      .sort((a, b) => (priceList[a] ?? 4) - (priceList[b] ?? 4))
      .slice(0, 50);

    let promises = sortedTlds.map(async (tld) => {
      let domain = `${input}.${tld}`;
      let available = await checkAvailability(domain);

      let price = calculatePrice(tld);

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
    let price = calculatePrice(tld);

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
