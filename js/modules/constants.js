// constants.js

// Définition des symboles de devises
export const currencySymbols = {
   'USD': '$',
    'CNY': 'CN¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'HKD': 'HK$',
    'MXN': 'MX$',
    'BRL': 'R$',
    'ZAR': 'R',
    'SGD': 'S$',
    'KRW': '₩',
    'TWD': 'NT$',
    'CHF': 'CHF',
    'NZD': 'NZ$',
    'SAR': 'SR',
    'IDR': 'Rp',
    'TRY': '₺',
    'EGP': 'E£',
    'PHP': '₱',
    'THB': '฿',
    'VND': '₫',
    'LKR': 'Rs',
    'BDT': '৳',
    'ARS': '$',
    'JMD': 'J$',
    'GHS': 'GH₵',
    'NGN': '₦',
    'UGX': 'USh',
    'MUR': 'Rs',
    'RON': 'lei',
    'RSD': 'дин.',
    'ALL': 'L',
    'CZK': 'Kč',
    'PLN': 'zł',
    'HUF': 'Ft',
    'RUB': '₽',
    'MYR': 'RM',
    'QAR': 'QR',
    'AED': 'AED',
    'KZT': '₸',
    'KES': 'KSh',
    'PKR': 'PKR',
    'BHD': 'BD',
    'OMR': 'OMR',
    'KWD': 'KD',
    'MAD': 'MAD',
    'TND': 'DT',
    'DZD': 'DA',
    'BGN': 'лв',
    'HRK': 'kn',
    'UAH': '₴',
    'BYN': 'Br',
    'GEL': '₾',
    'AMD': '֏',
    'AZN': '₼',
    'UZS': 'soʻm',
    'KGS': 'с',
    'TJS': 'ЅМ',
    'MNT': '₮',
    'LAK': '₭',
    'MMK': 'K',
    'KHR': '៛',
    'PGK': 'K',
    'FJD': 'FJ$',
    'WST': 'WS$',
    'TOP': 'T$',
    'VUV': 'VT',
    'XPF': '₣',
    'FKP': '£',
    'SHP': '£',
};

// Conversion des places boursières en devises
export const exchangeToCurrency = {
   'NASDAQ': 'USD',
    'NYSE': 'USD',
    'NYM': 'USD',
    'AMEX': 'USD',
    'NYQ': 'USD',
    'PCX': 'USD',
    'NMS': 'USD',
    'BATS': 'USD',
    'CBOE': 'USD',
    'IEX': 'USD',
 'PARIS': 'EUR'
    'PAR': 'EUR',
    'FRA': 'EUR',
    'GER': 'EUR',
    'MIL': 'EUR',
    'MAD': 'EUR',
    'BRU': 'EUR',
    'AMS': 'EUR',
    'LIS': 'EUR',
    'DUB': 'EUR',
    'PNK': 'EUR',
'Londres': 'GBP',
    'LSE': 'GBP',
    'AIM': 'GBP',
    'TSE': 'JPY',
    'HKEX': 'HKD',
    'SSE': 'CNY',
    'SZSE': 'CNY',
    'BSE': 'INR',
    'NSE': 'INR',
    'ASX': 'AUD',
    'TSX': 'CAD',
   'TOR' : 'CAD',
    'BMV': 'MXN',
    'B3': 'BRL',
    'JSE': 'ZAR',
    'SGX': 'SGD',
    'KRX': 'KRW',
    'TWSE': 'TWD',
    'SWX': 'CHF',
    'NZX': 'NZD',
    'OMX': 'EUR',
    'SASE': 'SAR',
    'IDX': 'IDR',
    'BIST': 'TRY',
    'EGX': 'EGP',
    'KSE': 'KRW',
    'TPEX': 'TWD',
    'BME': 'EUR',
    'EURONEXT': 'EUR',
    'MOEX': 'RUB',
    'WSE': 'PLN',
    'BUX': 'HUF',
    'PSE': 'PHP',
    'SET': 'THB',
    'HOSE': 'VND',
    'HNX': 'VND',
    'CSE': 'LKR',
    'DSE': 'BDT',
    'NEO': 'CAD',
    'ATHEX': 'EUR',
    'BCBA': 'ARS',
    'JSE': 'JMD',
    'GSE': 'GHS',
    'NSE': 'NGN',
    'USE': 'UGX',
    'CMA': 'MUR',
    'BVB': 'RON',
    'BELEX': 'RSD',
    'LUSE': 'ALL',
    'KLSE': 'MYR',
    'TASI': 'SAR',
    'KOSDAQ': 'KRW',
    'QSE': 'QAR',
    'ADX': 'AED',
    'DFM': 'AED',
    'KASE': 'KZT',
    'NSE': 'KES',
    'PSX': 'PKR',
    'BHB': 'BHD',
    'MSM': 'OMR',
    'BK': 'KWD',
    'CASE': 'MAD',
    'BVMT': 'TND',
    'ABV': 'DZD',
    'BSE': 'BGN',
    'ZSE': 'HRK',
    'PSE': 'CZK',
    'BVB': 'RON',
    'BSE': 'HUF',
    'WSE': 'PLN',
    'UKX': 'UAH',
    'BCSE': 'BYN',
    'GSE': 'GEL',
    'AMX': 'AMD',
    'BSE': 'AZN',
    'UZSE': 'UZS',
    'KSE': 'KGS',
    'DSE': 'TJS',
    'MSE': 'MNT',
    'LSX': 'LAK',
    'YSX': 'MMK',
    'CSX': 'KHR',
    'PSE': 'PHP',
    'IDX': 'IDR',
    'BURSA': 'MYR',
    'SGX': 'SGD',
    'SET': 'THB',
    'HOSE': 'VND',
    'KRX': 'KRW',
    'TWSE': 'TWD',
    'TSE': 'JPY',
    'HKEX': 'HKD',
    'SSE': 'CNY',
    'SZSE': 'CNY',
    'ASX': 'AUD',
    'NZX': 'NZD',
    'PNGX': 'PGK',
    'SPSE': 'FJD',
    'SSX': 'WST',
    'TSE': 'TOP',
    'VSE': 'VUV',
    'NOUMEA': 'XPF',
    'FKSE': 'FKP',
    'SHSE': 'SHP',
};
