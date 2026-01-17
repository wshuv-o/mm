const testCase = (pattern) => {
  {
    function getRandomUrl() {
      const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const randStr = (len) =>
        Array.from({ length: len }, () =>
          rand("abcdefghijklmnopqrstuvwxyz0123456789")
        ).join("");
      const randInt = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

      const tlds = ["com", "net", "org", "io", "dev", "app"];
      const protocols = ["http://", "https://", ""];
      const hasProtocol = Math.random() < 0.8;
      const hasPort = Math.random() < 0.3;
      const hasPath = Math.random() < 0.5;
      const useIp = Math.random() < 0.3;

      const protocol = hasProtocol ? rand(protocols) : "";
      const domain = useIp
        ? `${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(
            0,
            255
          )}`
        : `${randStr(randInt(3, 10))}.${rand(tlds)}`;
      const port = hasPort ? `:${randInt(1024, 9999)}` : "";
      const path = hasPath
        ? "/" +
          Array.from({ length: randInt(1, 4) }, () =>
            randStr(randInt(2, 8))
          ).join("/") +
          rand(["", "?x=1", "#top"])
        : "";

      return `${protocol}${domain}${port}${path}`;
    }

    // Generate and test
    const urls = Array.from({ length: 100 }, getRandomUrl);

    urls.forEach((url, i) => {
      const matches = url.match(pattern);
      const passed = matches && matches[0] === url;
      console.log(
        `${i + 1}. ${url} — ${passed ? "✅ matches" : "❌ no match"}`
      );
    });
  }

  console.log("___❌❌❌❌❌bad ceck ❌❌❌❌_");

  {
    const badUrls = [
      // Already included
      "htp://example.com",
      "https//example.com",
      "http://",
      "example",
      "ftp://example.com",
      "localhost:3000",
      "example.c",
      "http://999.999.999.999",
      "://example.com",
      "http:/example.com",
      "http://example.toolongtld",
      "example.com:port",
      "http://256.256.256.256",
      "https://",
      "/just/a/path",
      "http://.com",
      "http://example.",
      "http://-badstart.com",
      "http://exa_mple.com",
      "http://example..com",

      // Newly added
      "http://example.com::1234", // double colon port
      "http://exa mple.com", // space in domain
      "http://example.com/pa th", // space in path
      "http://example.com#frag#ment", // multiple fragments
      "http://💩.com", // emoji in domain
      "http://example.com/💩", // emoji in path
      "http://example.com:99999", // port out of range
      "http://example..com", // double dot
      "http:///example.com", // triple slash after protocol
      "http://.example.com", // starts with dot
      "http://example..", // ends with double dot
      "http://com", // TLD only
      ".com", // missing hostname
      "http://0.0.0.0", // typically reserved IP
      "http://012.034.056.078", // octal-looking IP
      "http://-example.com", // leading hyphen in domain
      "http://example-.com", // trailing hyphen in domain
      "http://example.-com", // hyphen right before TLD
      "http://ex..ample.com", // double dot in subdomain
      "http://example.com:abcd", // non-numeric port
      "https:http://example.com", // messed-up protocol combo
      "http://example.com/<>", // invalid characters in path
      "http://[::1]", // unescaped IPv6 — unsupported here
    ];

    badUrls.forEach((url, i) => {
      const matches = url.match(pattern);
      const passed = !matches;
      console.log(
        `${i + 1}. ${url} — ${
          passed ? "✅ correctly not matched" : "❌ matched when it shouldn’t"
        }`
      );
    });
  }
};
/**this pattern doesnot cover all the negative cases (see above).but those are negligible.*/
export const URL_PATTERN_RGX = new RegExp(
  // "^" +
  // Optional protocol
  "(" +
    "(?:https?:\\/\\/)?" +
    // Host (domain or IPv4)
    "(?:" +
    // Domain with TLD (2-24 characters)
    "(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\\.)+[a-zA-Z]{2,24}" +
    "|" +
    // IPv4
    "(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}" +
    "(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)" +
    ")" +
    // Optional port
    "(?:\\:\\d{2,5})?" +
    // Optional path
    "(?:\\/[^\\s?#]*)?" +
    // Optional query
    "(?:\\?[^\\s#]*)?" +
    // Optional fragment
    "(?:#[^\\s]*)?" +
    ")",
  // +
  // "$"
  "gi"
);
