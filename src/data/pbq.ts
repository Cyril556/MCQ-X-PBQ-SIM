export interface PBQFirewallRule {
  ruleId: number;
  sourceIP: string;
  destIP: string;
  port: string;
  protocol: string;
  action: string;
}

export interface PBQMatchingItem {
  source: string;
  target: string;
}

export interface PBQClassificationItem {
  item: string;
  category: string;
  categories: string[];
}

export interface PBQPlacementItem {
  item: string;
  correctZone: string;
  zones: string[];
}

export interface PBQQuestion {
  id: string;
  domain: string;
  title: string;
  description: string;
  type: 'firewall' | 'matching' | 'classification' | 'placement';
  firewallRules?: PBQFirewallRule[];
  firewallScenario?: string;
  correctActions?: string[];
  matchingItems?: PBQMatchingItem[];
  matchingTargets?: string[];
  classificationItems?: PBQClassificationItem[];
  classificationCategories?: string[];
  placementItems?: PBQPlacementItem[];
  placementZones?: string[];
}

export const pbqQuestions: PBQQuestion[] = [
  {
    id: "pbq-fw1",
    domain: "Firewall & ACL Configuration",
    title: "Configure DMZ Firewall Rules",
    description: "A company hosts a public web server in a DMZ. Configure the firewall rules to allow only necessary traffic. Set each rule's action to ALLOW or DENY.",
    type: "firewall",
    firewallScenario: "The web server (10.0.1.50) must be accessible via HTTP and HTTPS from the internet. SSH access should only be allowed from the management network (192.168.1.0/24). All other inbound traffic to the DMZ must be denied.",
    firewallRules: [
      { ruleId: 1, sourceIP: "Any", destIP: "10.0.1.50", port: "80", protocol: "TCP", action: "" },
      { ruleId: 2, sourceIP: "Any", destIP: "10.0.1.50", port: "443", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "192.168.1.0/24", destIP: "10.0.1.50", port: "22", protocol: "TCP", action: "" },
      { ruleId: 4, sourceIP: "Any", destIP: "10.0.1.50", port: "3306", protocol: "TCP", action: "" },
      { ruleId: 5, sourceIP: "Any", destIP: "10.0.1.50", port: "23", protocol: "TCP", action: "" },
    ],
    correctActions: ["ALLOW", "ALLOW", "ALLOW", "DENY", "DENY"],
  },
  {
    id: "pbq-fw2",
    domain: "Firewall & ACL Configuration",
    title: "Segment Internal Network Traffic",
    description: "Configure rules to properly segment traffic between the HR, Finance, and Engineering VLANs. Only authorized cross-VLAN communication should be permitted.",
    type: "firewall",
    firewallScenario: "HR (VLAN 10: 10.10.0.0/24) needs access to the Finance file server (10.20.0.10) on port 445. Engineering (VLAN 30: 10.30.0.0/24) must not access HR or Finance. All VLANs can access the DNS server (10.0.0.53) on port 53.",
    firewallRules: [
      { ruleId: 1, sourceIP: "10.10.0.0/24", destIP: "10.20.0.10", port: "445", protocol: "TCP", action: "" },
      { ruleId: 2, sourceIP: "10.30.0.0/24", destIP: "10.10.0.0/24", port: "Any", protocol: "Any", action: "" },
      { ruleId: 3, sourceIP: "10.30.0.0/24", destIP: "10.20.0.0/24", port: "Any", protocol: "Any", action: "" },
      { ruleId: 4, sourceIP: "Any", destIP: "10.0.0.53", port: "53", protocol: "UDP", action: "" },
      { ruleId: 5, sourceIP: "10.20.0.0/24", destIP: "10.10.0.0/24", port: "Any", protocol: "Any", action: "" },
    ],
    correctActions: ["ALLOW", "DENY", "DENY", "ALLOW", "DENY"],
  },
  {
    id: "pbq-match1",
    domain: "Cryptography",
    title: "Match Cryptographic Algorithms",
    description: "Drag each cryptographic algorithm to its correct category.",
    type: "matching",
    matchingItems: [
      { source: "AES-256", target: "Symmetric Encryption" },
      { source: "RSA", target: "Asymmetric Encryption" },
      { source: "SHA-256", target: "Hashing" },
      { source: "Diffie-Hellman", target: "Key Exchange" },
      { source: "3DES", target: "Symmetric Encryption" },
      { source: "ECC", target: "Asymmetric Encryption" },
    ],
    matchingTargets: ["Symmetric Encryption", "Asymmetric Encryption", "Hashing", "Key Exchange"],
  },
  {
    id: "pbq-match2",
    domain: "Network Security",
    title: "Match Ports to Services",
    description: "Drag each well-known port number to the correct network service.",
    type: "matching",
    matchingItems: [
      { source: "Port 22", target: "SSH" },
      { source: "Port 53", target: "DNS" },
      { source: "Port 443", target: "HTTPS" },
      { source: "Port 3389", target: "RDP" },
      { source: "Port 25", target: "SMTP" },
    ],
    matchingTargets: ["SSH", "DNS", "HTTPS", "RDP", "SMTP"],
  },
  {
    id: "pbq-class1",
    domain: "Threats & Vulnerabilities",
    title: "Classify Attack Types",
    description: "Classify each attack into its correct category by dragging it to the appropriate zone.",
    type: "classification",
    classificationCategories: ["Social Engineering", "Network Attack", "Application Attack", "Physical Attack"],
    classificationItems: [
      { item: "Phishing email with malicious link", category: "Social Engineering", categories: [] },
      { item: "ARP spoofing on local network", category: "Network Attack", categories: [] },
      { item: "SQL injection on login form", category: "Application Attack", categories: [] },
      { item: "Tailgating through secure door", category: "Physical Attack", categories: [] },
      { item: "Vishing (voice phishing) call", category: "Social Engineering", categories: [] },
      { item: "Cross-site scripting (XSS)", category: "Application Attack", categories: [] },
      { item: "Evil twin Wi-Fi access point", category: "Network Attack", categories: [] },
      { item: "Dumpster diving for documents", category: "Physical Attack", categories: [] },
    ],
  },
  {
    id: "pbq-place1",
    domain: "Security Architecture",
    title: "Place Security Controls in Network Zones",
    description: "Drag each security control to its correct network zone placement.",
    type: "placement",
    placementZones: ["Internet Edge", "DMZ", "Internal Network", "Data Center"],
    placementItems: [
      { item: "Web Application Firewall (WAF)", correctZone: "DMZ", zones: [] },
      { item: "Next-Gen Firewall", correctZone: "Internet Edge", zones: [] },
      { item: "Network IDS/IPS", correctZone: "Internal Network", zones: [] },
      { item: "Database Activity Monitor", correctZone: "Data Center", zones: [] },
      { item: "Reverse Proxy", correctZone: "DMZ", zones: [] },
      { item: "SIEM Collector", correctZone: "Internal Network", zones: [] },
    ],
  },
];
