let evolutionChart = null;
let investmentChart = null;
let selectedSymbol = ""; // Stocke le symbole sélectionné
let currencySymbol = ""; // Stocke le symbole de la devise
const exchangeToCurrency = {
    'NASDAQ': 'USD',
    'NYSE': 'USD',
    'AMEX': 'USD',
    'NYQ': 'USD', // NASDAQ
    'PCX': 'USD',
    'NMS': 'USD',
    'BATS': 'USD', // BATS Global Markets
    'CBOE': 'USD', // Chicago Board Options Exchange
    'IEX': 'USD', // Investors Exchange
    'PAR': 'EUR', // Euronext Paris
    'FRA': 'EUR', // Deutsche Börse (Frankfurt Stock Exchange)
    'GER': 'EUR', // Euronext Paris
    'MIL': 'EUR', // Borsa Italiana (Milan Stock Exchange)
    'MAD': 'EUR', // Bolsa de Madrid
    'BRU': 'EUR', // Euronext Brussels
    'AMS': 'EUR', // Euronext Amsterdam
    'LIS': 'EUR', // Euronext Lisbon
    'DUB': 'EUR', // Euronext Dublin
    'LSE': 'GBP', // London Stock Exchange
    'AIM': 'GBP' // Alternative Investment Market (part of LSE)
};
const currencySymbols = {
    'USD': '$',
    'CNY': 'CN¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'INR': 'R',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'HKD': 'HK$',
};

let excelData = null;
let excelCappedDatesAndAmounts = null;

//menu option écrétage
function toggleSection() {
    var section = document.getElementById("advancedSection");
    if (section.style.display === "none") {
        section.style.display = "block";
    } else {
        section.style.display = "none";
    }
}


window.onload = function() {
    const today = new Date();
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    // Définir la date de fin comme la fin du mois précédent
    const endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    document.getElementById('startDate').value = lastYear.toISOString().split('T')[0];
}

document.getElementById('startDate').addEventListener('change', function() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    // Assurez-vous que la date de fin est après la date de début
    if (endDate <= startDate) {
        endDateInput.value = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1).toISOString().split('T')[0];
    }
});

document.getElementById('endDate').addEventListener('change', function() {
    const endDateInput = document.getElementById('endDate');
    const startDateInput = document.getElementById('startDate');
    const endDate = new Date(endDateInput.value);
    const startDate = new Date(startDateInput.value);
    // Assurez-vous que la date de début est avant la date de fin
    if (startDate >= endDate) {
        startDateInput.value = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1).toISOString().split('T')[0];
    }
});

// Recherche dynamique avec suggestions
document.getElementById('searchInput').addEventListener('input', async function() {
    const query = this.value.trim();
    if (!query) {
        document.getElementById('suggestions').style.display = 'none';
        return;
    }
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = "Chargement...";
    suggestionsContainer.style.display = 'block';
    try {
        const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v1/finance/search?q=${query}^`)}`;
        const response = await fetch(url);
        const data = await response.json();
        const results = JSON.parse(data.contents).quotes;
        suggestionsContainer.innerHTML = results.map(result =>
            `<div onclick="selectSymbol('${result.symbol}', '${(result.longname || '').replace(/'/g, "\\'")}', '${(result.exchange || '').replace(/'/g, "\\'")}', '${(result.quoteType || '').replace(/'/g, "\\'")}', '${(result.actor || '').replace(/'/g, "\\'")}', '${(result.industry || '').replace(/'/g, "\\'")}')">
                ${result.shortname || result.symbol} (${result.symbol})
            </div>`
        ).join('');
        if (results.length === 0) {
            suggestionsContainer.innerHTML = "Aucun résultat trouvé.";
        }
    } catch (error) {
        console.error("Erreur lors de la recherche : ", error);
        suggestionsContainer.innerHTML = "Erreur lors de la recherche.";
    }
});

// Fonction pour sélectionner un symbole
function selectSymbol(symbol, name, exchange, type, sector, industry) {
    selectedSymbol = symbol;
    document.getElementById('searchInput').value = symbol;
    document.getElementById('suggestions').style.display = 'none';
    // Déduire la devise en fonction de la place de cotation
    const currency = exchangeToCurrency[exchange] || 'N/A';
    currencySymbol = currencySymbols[currency] || currency;
    // Afficher les informations de l'action
    document.getElementById('stockName').innerText = name;
    document.getElementById('stockSymbol').innerText = symbol;
    document.getElementById('stockExchange').innerText = exchange;
    document.getElementById('stockCurrency').innerText = currencySymbol;
    document.getElementById('stockType').innerText = type;
    document.getElementById('stockSector').innerText = sector;
    document.getElementById('stockIndustry').innerText = industry;
    document.getElementById('stockInfo').style.display = 'block';
    // Mettre à jour le symbole de la devise pour le montant mensuel investi
    document.getElementById('currencySymbolLabel').innerText = currencySymbol;
    fetchData(); //Appel à fetchData après avoir sélectionné le symbole
}

async function fetchData() {
    if (!selectedSymbol) {
        alert("Veuillez rechercher et sélectionner une valeur avant de continuer.");
        return;
    }
    const loadingIndicator = document.getElementById('loadingIndicator');
    const startDateInput = new Date(document.getElementById('startDate').value);
    const endDateInput = new Date(document.getElementById('endDate').value);
    const startDate = startDateInput.getTime() / 1000;
    const endDate = endDateInput.getTime() / 1000;
      // Récupérer la valeur numérique (sans espace) des champs de saisie
      const initialInvestment = parseFloat(document.getElementById('initialInvestment').value.replace(/\s/g, '')) || 0;
      const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value.replace(/\s/g, '')) || 0;
    // Récupérer le pourcentage d'écrêtage depuis le select
    const cappingPercentage = parseFloat(document.getElementById('cappingPercentage').value) || 0.05;
    // Récupérer le montant minimum d'écrêtage depuis le select
    const minCappingAmount = parseFloat(document.getElementById('minCappingAmount').value) || 100;
    // Récupérer le taux d'intérêt annuel
     const annualInterestRate = parseFloat(document.getElementById('interestRate').value) || 0.02;
      const monthlyInterestRate = annualInterestRate / 12;
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${selectedSymbol}?period1=${startDate}&period2=${endDate}&interval=1mo`)}`;
    loadingIndicator.style.display = 'block';
    try {
        const response = await fetch(url);
        const data = await response.json();
        const yahooData = JSON.parse(data.contents);
        console.log('API Response:', yahooData); // Log the API response for debugging
        if (!yahooData.chart || !yahooData.chart.result) {
            alert('Aucune donnée disponible pour cet indice.');
            return;
        }
        const result = yahooData.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;

        let totalInvested = initialInvestment;
        let totalShares = initialInvestment / prices[0]; // Acheter des actions avec le versement initial
        let numberOfPayments = initialInvestment > 0 ? 1 : 0;
        let maxLossAmount = 0;
        let maxLossPercentage = 0;
        let maxGainAmount = 0;
        let maxGainPercentage = 0;
        let maxLossDate = '';
        let maxGainDate = '';

        let totalInvestedEcrete = initialInvestment;
        let totalSharesEcrete = initialInvestment / prices[0];
        let totalSharesSoldEcrete = 0;
        let securedGains = 0;
         let securedGainsInterest = 0; // Variable pour les intérêts générés
        let cappedDatesAndAmounts = [];
         let cappedDatesAndAmountsWithInterest = []; // Tableau pour stocker les dates d'écrêtage avec les intérêts


        let maxLossAmountEcrete = 0;
        let maxLossPercentageEcrete = 0;
        let maxGainAmountEcrete = 0;
        let maxGainPercentageEcrete = 0;
        let maxLossDateEcrete = '';
        let maxGainDateEcrete = '';

        const chartData = {
            labels: [],
            prices: [],
            investments: [],
            portfolio: [],
            sharesBought: [],
            totalShares: [],
            portfolioValueEcreteSansGain: [],
            totalSharesSoldEcrete: [],
            totalSharesEcrete: [],
            securedGains: [],
            portfolioValueEcrete: [],
            portfolioValueEcreteAvecGain: [],
            securedGainsInterest: [], //Ajout des interet générer
             totalInvestedEcreteHistory: []
        };

         const filteredData = [];
        const firstDays = new Set();
        for (let i = 0; i < timestamps.length; i++) {
            const currentDate = new Date(timestamps[i] * 1000);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);

            if (currentDate.toDateString() === firstDayOfMonth.toDateString()) {
                if (!firstDays.has(firstDayOfMonth.toDateString())) {
                    filteredData.push({ date: currentDate, price: prices[i] });
                    firstDays.add(firstDayOfMonth.toDateString());
                }
            }
        }
          let lastCappedMonth = null;
        filteredData.forEach((data, index) => {
            const dateString = data.date.toISOString().split('T')[0];
            chartData.labels.push(dateString);
            chartData.prices.push(data.price);
            if (index < filteredData.length - 1) {
                totalInvested += monthlyInvestment;
                const sharesBought = monthlyInvestment / data.price;
                totalShares += sharesBought;
                numberOfPayments++;
                chartData.sharesBought.push(sharesBought);

                // Portefeuille écrêté
                totalInvestedEcrete += monthlyInvestment;
                const sharesBoughtEcrete = monthlyInvestment / data.price;
                totalSharesEcrete += sharesBoughtEcrete;

                const portfolioValueEcreteSansGain = totalSharesEcrete * data.price;
                const gainAmountEcrete = portfolioValueEcreteSansGain - totalInvestedEcrete;
                const gainPercentageEcrete = (gainAmountEcrete / totalInvestedEcrete) * 100;

                 // Modification de la condition d'écrêtage
                if (gainAmountEcrete >= minCappingAmount && gainPercentageEcrete > (cappingPercentage * 100)) {
                    securedGains += gainAmountEcrete;
                    const unitsToSell = gainAmountEcrete / data.price;
                     totalSharesEcrete -= unitsToSell;
                    totalSharesSoldEcrete += unitsToSell;
                     cappedDatesAndAmounts.push({ date: dateString, amount: gainAmountEcrete.toFixed(2) });
                     cappedDatesAndAmountsWithInterest.push({ date: dateString, amount: gainAmountEcrete, interest:0 });
                     lastCappedMonth = dateString;


                }

               // Calculer les intérêts sur les montants écrêtés
            if (lastCappedMonth && securedGains > 0) {
                    let interestToAdd = 0
                    cappedDatesAndAmountsWithInterest.forEach(item => {
                         if(item.date < dateString){
                             const dateCapped = new Date(item.date);
                            const dateCurrent = new Date(dateString)
                            const monthDiff = (dateCurrent.getFullYear() - dateCapped.getFullYear()) * 12 + (dateCurrent.getMonth() - dateCapped.getMonth())
                            const interest = item.amount * (Math.pow(1 + monthlyInterestRate, monthDiff) - 1);
                            item.interest = interest
                              interestToAdd += interest;
                        }
                    })

                securedGainsInterest = interestToAdd
               }


                chartData.totalSharesSoldEcrete.push(totalSharesSoldEcrete);
                chartData.totalSharesEcrete.push(totalSharesEcrete);
                chartData.securedGains.push(securedGains);
                 chartData.securedGainsInterest.push(securedGainsInterest); // Ajouter les intérêts au tableau
                chartData.portfolioValueEcreteSansGain.push(portfolioValueEcreteSansGain);

                // Calculer portfolioValueEcrete après l'écrêtage
                const portfolioValueEcrete = totalSharesEcrete * data.price;
                chartData.portfolioValueEcrete.push(portfolioValueEcrete);

                // Calculer portfolioValueEcreteAvecGain
                 const portfolioValueEcreteAvecGain = portfolioValueEcrete + securedGains + securedGainsInterest;
                chartData.portfolioValueEcreteAvecGain.push(portfolioValueEcreteAvecGain);
                 chartData.totalInvestedEcreteHistory.push(totalInvestedEcrete);
            } else {
                chartData.sharesBought.push(0);
                chartData.totalSharesSoldEcrete.push(totalSharesSoldEcrete);
                chartData.totalSharesEcrete.push(totalSharesEcrete);
                const portfolioValueEcreteSansGain = totalSharesEcrete * data.price;
                 chartData.securedGains.push(securedGains);
                  chartData.securedGainsInterest.push(securedGainsInterest); // Ajouter les intérêts au tableau
                chartData.portfolioValueEcreteSansGain.push(portfolioValueEcreteSansGain);

                // Calculer portfolioValueEcrete après l'écrêtage
                const portfolioValueEcrete = totalSharesEcrete * data.price;
                chartData.portfolioValueEcrete.push(portfolioValueEcrete);

                // Calculer portfolioValueEcreteAvecGain
                const portfolioValueEcreteAvecGain = portfolioValueEcrete + securedGains + securedGainsInterest;
                chartData.portfolioValueEcreteAvecGain.push(portfolioValueEcreteAvecGain);
                 chartData.totalInvestedEcreteHistory.push(totalInvestedEcrete);
            }

            chartData.totalShares.push(totalShares);
            chartData.investments.push(totalInvested);
            chartData.portfolio.push(totalShares * data.price);

            const currentLossAmount = totalInvested - (totalShares * data.price);
            const currentLossPercentage = (currentLossAmount / totalInvested) * 100;
            const currentGainAmount = (totalShares * data.price) - totalInvested;
            const currentGainPercentage = (currentGainAmount / totalInvested) * 100;
            if (currentLossAmount > maxLossAmount) {
                maxLossAmount = currentLossAmount;
                maxLossPercentage = currentLossPercentage;
                maxLossDate = new Date(dateString).toISOString().split('T')[0];
            }
            if (currentGainAmount > maxGainAmount) {
                maxGainAmount = currentGainAmount;
                maxGainPercentage = currentGainPercentage;
                maxGainDate = new Date(dateString).toISOString().split('T')[0];
            }

             // Calcul de la moins value et plus value maximale du portefeuille écrêter
            const currentLossAmountEcrete = totalInvestedEcrete - chartData.portfolioValueEcrete[index];
            const currentLossPercentageEcrete = (currentLossAmountEcrete / totalInvestedEcrete) * 100;
            const currentGainAmountEcrete = chartData.portfolioValueEcrete[index] - totalInvestedEcrete;
            const currentGainPercentageEcrete = (currentGainAmountEcrete / totalInvestedEcrete) * 100;
           const currentGainLossEcreteAvecGain =  chartData.securedGains[index] + chartData.securedGainsInterest[index] + (chartData.portfolioValueEcrete[index] - chartData.totalInvestedEcreteHistory[index]);

             if (currentGainLossEcreteAvecGain < 0 && Math.abs(currentGainLossEcreteAvecGain) > Math.abs(maxLossAmountEcrete)) {
                maxLossAmountEcrete = currentGainLossEcreteAvecGain;
                maxLossDateEcrete = new Date(dateString).toISOString().split('T')[0];
                 maxLossPercentageEcrete = (currentGainLossEcreteAvecGain / totalInvestedEcrete) * 100
           }
             if (currentGainAmountEcrete > maxGainAmountEcrete) {
                maxGainAmountEcrete = currentGainAmountEcrete;
                maxGainPercentageEcrete = currentGainPercentageEcrete;
                maxGainDateEcrete = new Date(dateString).toISOString().split('T')[0];
            }
        });

        const lastPrice = filteredData[filteredData.length - 1].price;
        const gainLossPercentage = ((totalShares * lastPrice - totalInvested) / totalInvested) * 100;
        const gainLossAmount = (totalShares * lastPrice - totalInvested);

        const stockChangePercentage = ((lastPrice - filteredData[0].price) / filteredData[0].price) * 100;
        document.getElementById('finalTotalInvested').innerHTML = `<span class="${gainLossPercentage >= 0 ? 'positive' : 'negative'}">${totalInvested.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span>`;
        document.getElementById('finalNumberOfPayments').innerHTML = `${numberOfPayments} mois soit ${Math.floor(numberOfPayments / 12)} ans et ${numberOfPayments % 12} mois`;
        document.getElementById('finalStockChangePercentage').innerHTML = `<span class="${stockChangePercentage >= 0 ? 'positive' : 'negative'}">${stockChangePercentage.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span>`;
        document.getElementById('finalPortfolioValue').innerHTML = `<span class="${gainLossPercentage >= 0 ? 'positive' : 'negative'}">${(totalShares * lastPrice).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> au ${filteredData[filteredData.length - 1].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        document.getElementById('finalGainLossLabel').innerHTML = gainLossPercentage >= 0 ? 'Gain' : 'Perte';
        
        document.getElementById('finalGainLossPercentage').innerHTML = `<span class="${gainLossAmount >= 0 ? 'positive' : 'negative'}">${gainLossAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> au ${filteredData[filteredData.length - 1].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} soit <span class="${gainLossPercentage >= 0 ? 'positive' : 'negative'}">${gainLossPercentage.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span>`;
        
        document.getElementById('finalMaxLossAmount').innerHTML = `<span class="negative">-${Math.abs(maxLossAmount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> soit : <span class="negative">-${Math.abs(maxLossPercentage).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span> de l'investissement au : ${new Date(maxLossDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        document.getElementById('finalMaxGainAmount').innerHTML = `<span class="positive">${maxGainAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> soit : <span class="positive">${maxGainPercentage.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span> de l'investissement au : ${new Date(maxGainDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

        // Portefeuille écrêté
        const finalPortfolioValueEcrete = totalSharesEcrete * lastPrice;
        const finalPortfolioValueEcreteAvecGain = finalPortfolioValueEcrete + securedGains + securedGainsInterest;
        const finalGainLossAmountEcrete = finalPortfolioValueEcreteAvecGain - totalInvestedEcrete;
        const finalGainLossPercentageEcrete = (finalGainLossAmountEcrete / totalInvestedEcrete) * 100;

        document.getElementById('portfolioValueEcreteAvecGain').innerHTML = `<span class="${finalGainLossPercentageEcrete >= 0 ? 'positive' : 'negative'}">${finalPortfolioValueEcreteAvecGain.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span>`;
        document.getElementById('finalPortfolioValueEcrete').innerHTML = `<span class="${finalGainLossPercentageEcrete >= 0 ? 'positive' : 'negative'}">${finalPortfolioValueEcrete.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span>`;
        document.getElementById('finalTotalEcrete').innerHTML = `<span class="${finalGainLossPercentageEcrete >= 0 ? 'positive' : 'negative'}">${securedGains.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span>`;
          document.getElementById('finalTotalEcreteInterest').innerHTML = `<span class="${finalGainLossPercentageEcrete >= 0 ? 'positive' : 'negative'}">${securedGainsInterest.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span>`;

        document.getElementById('finalGainEcrete').innerHTML = `<span class="${finalGainLossPercentageEcrete >= 0 ? 'positive' : 'negative'}">${finalGainLossAmountEcrete.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> au ${filteredData[filteredData.length - 1].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} soit <span class="${finalGainLossPercentageEcrete >= 0 ? 'positive' : 'negative'}">${finalGainLossPercentageEcrete.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span>`;
 
        
        document.getElementById('finalMaxLossAmountEcrete').innerHTML = `<span class="negative">-${Math.abs(maxLossAmountEcrete).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> soit : <span class="negative">-${Math.abs(maxLossPercentageEcrete).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span> de l'investissement au : ${new Date(maxLossDateEcrete).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        document.getElementById('finalMaxGainAmountEcrete').innerHTML = `<span class="positive">${maxGainAmountEcrete.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ${currencySymbol}</span> soit : <span class="positive">${maxGainPercentageEcrete.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} %</span> de l'investissement au : ${new Date(maxGainDateEcrete).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;

        // Ajouter les lignes pour les gains sécurisés
        const securedGainsTableBody = document.getElementById('securedGainsTableBody');
        securedGainsTableBody.innerHTML = ''; // Vider le contenu précédent
        cappedDatesAndAmountsWithInterest.forEach(item => {
            const row = document.createElement('tr');
             row.innerHTML = `<td>${item.date}</td><td>${item.amount.toFixed(2).replace('.', ',')} ${currencySymbol}</td><td>${item.interest.toFixed(2).replace('.', ',')} ${currencySymbol}</td>`;
            securedGainsTableBody.appendChild(row);
        });


        // Mettre à jour le graphique d'évolution
        updateEvolutionChart(chartData.labels, chartData.prices);

        // Mettre à jour le graphique des montants investis et de l'évolution du portefeuille
        updateInvestmentChart(chartData.labels, chartData.investments, chartData.portfolio, chartData.portfolioValueEcreteAvecGain);

         // Stocker les données pour le fichier excel
        excelData = chartData;
        excelCappedDatesAndAmounts = cappedDatesAndAmountsWithInterest;

         } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        alert('Erreur lors de la récupération des données. Veuillez réessayer.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}


function updateEvolutionChart(labels, prices) {
    const ctxEvolution = document.getElementById('evolutionChart').getContext('2d');
    if (evolutionChart) evolutionChart.destroy();
    // Graphique de l'évolution du support choisi
    evolutionChart = new Chart(ctxEvolution, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Prix du support',
                    data: prices,
                    borderColor: 'rgb(0, 0, 255)',
                    tension: 0.1,
                    yAxisID: 'y',
                    order: 1
                }
            ]
        },
        options: {
           responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Évolution du support choisi'
                }
            },
            scales: {
                y: {
                    ticks: {
                        color: 'white'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

function updateInvestmentChart(labels, investments, portfolio, portfolioValueEcreteAvecGain) {
    const ctxInvestment = document.getElementById('investmentChart').getContext('2d');
    if (investmentChart) investmentChart.destroy();
    // Graphique des montants investis et de l'évolution du portefeuille
    investmentChart = new Chart(ctxInvestment, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                               {
                    label: 'Valeur du portefeuille',
                    data: portfolio,
                    type: 'line',
                    borderColor: 'rgb(255, 135, 0)',
                    tension: 0.1,
                    yAxisID: 'y',
                    order: 1
                },
                {
                    label: 'Valeur du portefeuille écrêté avec gains',
                    data: portfolioValueEcreteAvecGain,
                    type: 'line',
                    borderColor: 'rgb(0, 0, 255)',
                    tension: 0.1,
                    yAxisID: 'y',
                    order: 2
                },
                {
                    label: 'Montant total investi',
                    data: investments,
                    backgroundColor: 'rgb(0, 255, 0)',
                    borderColor: 'rgb(0, 255, 0)',
                    borderWidth: 1,
                    yAxisID: 'y',
                    order: 3
                },
            ]
        },
         options: {
             responsive: true,
             maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Montants investis et évolution du portefeuille'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    }
                }
            }
        }
    });
}


// Fonction pour basculer entre les thèmes clair et sombre
function toggleTheme() {
    const body = document.body;
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

function generateFileName() {
  const now = new Date();
  const formattedDate = now.toISOString().replace(/[-:.T]/g, '').slice(0, 14);
  return `${formattedDate}FoxVelocity.xlsx`;
}

// Fonction pour générer un fichier Excel
// Fonction pour générer un fichier Excel
function generateExcelFile(chartData, cappedDatesAndAmounts) {
    // En-têtes en anglais
    const headers = [
        'date', 'price', 'totalInvested', 'portfolioValue', 'sharesBought', 'totalShares', 'totalSharesSoldEcrete', 'totalSharesEcrete', 'securedGains', 'securedGainsInterest', 'portfolioValueEcreteSansGain', 'portfolioValueEcrete', 'portfolioValueEcreteAvecGain', 'gainLossEcrete', 'gainLossEcreteAvecGain'
    ];
    // En-têtes en français
    const frenchHeaders = [
        'Date', 'Prix', 'Montant Total Investi', 'Valeur du Portefeuille', 'Parts Achetées', 'Total Parts', 'Parts Vendues Écrêtage', 'Total Parts Écrêtage', 'Gains Sécurisés', 'Intérêts des Gains Sécurisés', 'Valeur du Portefeuille Écrêté sans Gains', 'Valeur du Portefeuille Écrêté', 'Valeur du Portefeuille Écrêté avec Gains', 'Plus/Moins-value Ecrêtée', 'Plus/Moins-value Ecrêtée avec Gains'
    ];
    
    // Créer une feuille de calcul avec les en-têtes
    const ws = XLSX.utils.json_to_sheet([], { header: headers });
    // Ajouter la deuxième ligne d'en-têtes en français
    XLSX.utils.sheet_add_aoa(ws, [frenchHeaders], { origin: 'A2' });

    // Préparer les données pour la feuille de calcul
    const data = chartData.labels.map((label, index) => ({
        date: label,
        price: chartData.prices[index],
        totalInvested: chartData.investments[index],
        portfolioValue: chartData.portfolio[index],
        sharesBought: chartData.sharesBought[index],
        totalShares: chartData.totalShares[index],
        totalSharesSoldEcrete: chartData.totalSharesSoldEcrete[index],
        totalSharesEcrete: chartData.totalSharesEcrete[index],
        securedGains: chartData.securedGains[index],
         securedGainsInterest: chartData.securedGainsInterest[index],
        portfolioValueEcreteSansGain: chartData.portfolioValueEcreteSansGain[index],
        portfolioValueEcrete: chartData.portfolioValueEcrete[index],
        portfolioValueEcreteAvecGain: chartData.portfolioValueEcreteAvecGain[index],
        gainLossEcrete: chartData.portfolioValueEcrete[index] - chartData.totalInvestedEcreteHistory[index],
         gainLossEcreteAvecGain: chartData.securedGains[index] + chartData.securedGainsInterest[index] + (chartData.portfolioValueEcrete[index] - chartData.totalInvestedEcreteHistory[index])
    }));

    // Ajouter les données
    XLSX.utils.sheet_add_json(ws, data, { origin: 'A3', skipHeader: true });

    // Ajouter les dates et montants de l'écrêtage
       XLSX.utils.sheet_add_aoa(ws, [['Date', 'Montant écrêté', 'Intérêts du montant écrêté']], { origin: { r: data.length + 4, c: 0 } });
    cappedDatesAndAmounts.forEach((item, index) => {
        XLSX.utils.sheet_add_aoa(ws, [[item.date, item.amount.toFixed(2).replace('.', ','), item.interest.toFixed(2).replace('.', ',')]], { origin: { r: data.length + 5 + index, c: 0 } });
    });

    // Créer un classeur et ajouter la feuille de calcul
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Données');

    // Enregistrer le fichier Excel avec un nom dynamique
    XLSX.writeFile(wb, generateFileName());
}

function downloadExcel() {
        if(excelData && excelCappedDatesAndAmounts){
            generateExcelFile(excelData, excelCappedDatesAndAmounts);
       } else {
            alert("Aucune donnée à exporter, veuillez faire une simulation.");
        }
     }

     // formateront les nombres avec un espace tous les trois chiffres pendant que l'utilisateur les saisit,
     function formatNumberInput(input) {
        let value = input.value.replace(/\D/g, ''); // Supprime tout caractère non numérique
        // Limiter à 16 chiffres pour éviter les problèmes de performances et de saisie
        if (value.length > 16) {
            value = value.slice(0, 16);
        }
        input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Ajoute des espaces
    }
    document.getElementById('initialInvestment').addEventListener('input', function() {
       formatNumberInput(this);
    });
   
    document.getElementById('monthlyInvestment').addEventListener('input', function() {
        formatNumberInput(this);
    });   