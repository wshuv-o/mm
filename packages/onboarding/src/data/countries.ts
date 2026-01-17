
export interface Country {
  code: string;
  name: string;
}

export interface State {
  code: string;
  name: string;
  countryCode: string;
}

export const countries: Country[] = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
];

export const states: State[] = [
  // United States
  { code: "AL", name: "Alabama", countryCode: "US" },
  { code: "AK", name: "Alaska", countryCode: "US" },
  { code: "AZ", name: "Arizona", countryCode: "US" },
  { code: "AR", name: "Arkansas", countryCode: "US" },
  { code: "CA", name: "California", countryCode: "US" },
  { code: "CO", name: "Colorado", countryCode: "US" },
  { code: "CT", name: "Connecticut", countryCode: "US" },
  { code: "DE", name: "Delaware", countryCode: "US" },
  { code: "FL", name: "Florida", countryCode: "US" },
  { code: "GA", name: "Georgia", countryCode: "US" },
  { code: "NY", name: "New York", countryCode: "US" },
  { code: "TX", name: "Texas", countryCode: "US" },
  
  // India
  { code: "AP", name: "Andhra Pradesh", countryCode: "IN" },
  { code: "AR", name: "Arunachal Pradesh", countryCode: "IN" },
  { code: "AS", name: "Assam", countryCode: "IN" },
  { code: "BR", name: "Bihar", countryCode: "IN" },
  { code: "CG", name: "Chhattisgarh", countryCode: "IN" },
  { code: "GA", name: "Goa", countryCode: "IN" },
  { code: "GJ", name: "Gujarat", countryCode: "IN" },
  { code: "HR", name: "Haryana", countryCode: "IN" },
  { code: "HP", name: "Himachal Pradesh", countryCode: "IN" },
  { code: "JK", name: "Jammu and Kashmir", countryCode: "IN" },
  { code: "JH", name: "Jharkhand", countryCode: "IN" },
  { code: "KA", name: "Karnataka", countryCode: "IN" },
  { code: "KL", name: "Kerala", countryCode: "IN" },
  { code: "MP", name: "Madhya Pradesh", countryCode: "IN" },
  { code: "MH", name: "Maharashtra", countryCode: "IN" },
  { code: "MN", name: "Manipur", countryCode: "IN" },
  { code: "ML", name: "Meghalaya", countryCode: "IN" },
  { code: "MZ", name: "Mizoram", countryCode: "IN" },
  { code: "NL", name: "Nagaland", countryCode: "IN" },
  { code: "OR", name: "Odisha", countryCode: "IN" },
  { code: "PB", name: "Punjab", countryCode: "IN" },
  { code: "RJ", name: "Rajasthan", countryCode: "IN" },
  { code: "SK", name: "Sikkim", countryCode: "IN" },
  { code: "TN", name: "Tamil Nadu", countryCode: "IN" },
  { code: "TS", name: "Telangana", countryCode: "IN" },
  { code: "TR", name: "Tripura", countryCode: "IN" },
  { code: "UP", name: "Uttar Pradesh", countryCode: "IN" },
  { code: "UK", name: "Uttarakhand", countryCode: "IN" },
  { code: "WB", name: "West Bengal", countryCode: "IN" },
  { code: "DL", name: "Delhi", countryCode: "IN" },
  
  // Canada
  { code: "AB", name: "Alberta", countryCode: "CA" },
  { code: "BC", name: "British Columbia", countryCode: "CA" },
  { code: "MB", name: "Manitoba", countryCode: "CA" },
  { code: "NB", name: "New Brunswick", countryCode: "CA" },
  { code: "NL", name: "Newfoundland and Labrador", countryCode: "CA" },
  { code: "NS", name: "Nova Scotia", countryCode: "CA" },
  { code: "ON", name: "Ontario", countryCode: "CA" },
  { code: "PE", name: "Prince Edward Island", countryCode: "CA" },
  { code: "QC", name: "Quebec", countryCode: "CA" },
  { code: "SK", name: "Saskatchewan", countryCode: "CA" },
  
  // United Kingdom
  { code: "ENG", name: "England", countryCode: "GB" },
  { code: "SCT", name: "Scotland", countryCode: "GB" },
  { code: "WLS", name: "Wales", countryCode: "GB" },
  { code: "NIR", name: "Northern Ireland", countryCode: "GB" },
  
  // Australia
  { code: "NSW", name: "New South Wales", countryCode: "AU" },
  { code: "VIC", name: "Victoria", countryCode: "AU" },
  { code: "QLD", name: "Queensland", countryCode: "AU" },
  { code: "WA", name: "Western Australia", countryCode: "AU" },
  { code: "SA", name: "South Australia", countryCode: "AU" },
  { code: "TAS", name: "Tasmania", countryCode: "AU" },
  { code: "ACT", name: "Australian Capital Territory", countryCode: "AU" },
  { code: "NT", name: "Northern Territory", countryCode: "AU" },
];

export const getStatesByCountry = (countryCode: string): State[] => {
  return states.filter(state => state.countryCode === countryCode);
};
