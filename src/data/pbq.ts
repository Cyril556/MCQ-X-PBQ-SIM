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
  explanation?: string;
}

export interface PBQSet {
  id: string;
  label: string;
  questions: PBQQuestion[];
}

/* ========== SET A (original) ========== */
const setA: PBQQuestion[] = [
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
    explanation: "HTTP (80) and HTTPS (443) must be allowed for public web access. SSH (22) is allowed only from the management subnet. MySQL (3306) and Telnet (23) should always be denied from external sources in a DMZ.",
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
    explanation: "HR needs file sharing access to Finance (port 445). Engineering must be completely isolated from HR and Finance VLANs. DNS (port 53) is a shared service all VLANs need. Finance should not have blanket access to HR.",
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
    explanation: "AES-256 and 3DES use the same key for encryption/decryption (symmetric). RSA and ECC use key pairs (asymmetric). SHA-256 produces a fixed-length digest (hashing). Diffie-Hellman enables two parties to establish a shared secret over an insecure channel (key exchange).",
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
    explanation: "SSH uses port 22 for secure remote access. DNS uses port 53 for name resolution. HTTPS uses port 443 for encrypted web traffic. RDP uses port 3389 for Windows remote desktop. SMTP uses port 25 for sending email.",
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
    explanation: "Social engineering manipulates people (phishing, vishing). Network attacks target infrastructure (ARP spoofing, evil twin). Application attacks exploit software flaws (SQLi, XSS). Physical attacks involve physical access (tailgating, dumpster diving).",
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
    explanation: "WAFs and reverse proxies protect web servers in the DMZ. Next-Gen Firewalls sit at the Internet edge for perimeter defense. IDS/IPS and SIEM collectors monitor internal network traffic. Database activity monitors protect data center assets.",
  },
];

/* ========== SET B (from Messer Exam A PBQs) ========== */
const setB: PBQQuestion[] = [
  {
    id: "pbq-b-match1",
    domain: "Threats & Vulnerabilities",
    title: "Match Attack Descriptions to Attack Types",
    description: "Match each description with the most accurate attack type. Not all attack types will be used.",
    type: "matching",
    matchingItems: [
      { source: "Attacker obtains bank details by calling the victim", target: "Vishing" },
      { source: "Attacker accesses a database from a web browser", target: "Injection" },
      { source: "Attacker intercepts client-server communication", target: "On-path" },
      { source: "Multiple attackers overwhelm a web server", target: "DDoS" },
      { source: "Attacker captures all login credentials typed in 24 hours", target: "Keylogger" },
    ],
    matchingTargets: ["Vishing", "Injection", "On-path", "DDoS", "Keylogger", "RFID Cloning", "Rootkit", "Supply Chain"],
    explanation: "Vishing is phone-based social engineering. SQL injection accesses databases through web apps. On-path (MitM) intercepts communications. DDoS uses multiple attackers to overwhelm services. Keyloggers capture all keyboard input.",
  },
  {
    id: "pbq-b-place1",
    domain: "Security Architecture",
    title: "Place Security Controls at Locations",
    description: "Select the BEST security control for each location. All controls will be used once.",
    type: "placement",
    placementZones: ["Outside (Parking)", "Reception (Lobby)", "Data Center Door", "Server Console"],
    placementItems: [
      { item: "Fencing", correctZone: "Outside (Parking)", zones: [] },
      { item: "Lighting", correctZone: "Outside (Parking)", zones: [] },
      { item: "Security Guard", correctZone: "Reception (Lobby)", zones: [] },
      { item: "Access Control Vestibule", correctZone: "Reception (Lobby)", zones: [] },
      { item: "Access Badge + Biometrics", correctZone: "Data Center Door", zones: [] },
      { item: "Authentication Token + Password", correctZone: "Server Console", zones: [] },
    ],
    explanation: "Outside areas need fencing and lighting for safety. Reception requires guards and vestibules to manage entry. Data center doors need badge + biometric authentication. Server consoles require multi-factor authentication (password + token).",
  },
  {
    id: "pbq-b-class1",
    domain: "General Security Concepts",
    title: "Classify Security Control Categories",
    description: "Classify each security measure into the correct control category.",
    type: "classification",
    classificationCategories: ["Technical", "Managerial", "Operational", "Physical"],
    classificationItems: [
      { item: "Guard checks identification of all visitors", category: "Operational", categories: [] },
      { item: "All returns must be approved by a VP", category: "Managerial", categories: [] },
      { item: "Generator used during power outage", category: "Physical", categories: [] },
      { item: "Building doors unlocked with access card", category: "Physical", categories: [] },
      { item: "System logs transferred automatically to SIEM", category: "Technical", categories: [] },
      { item: "Firewall blocks unauthorized traffic", category: "Technical", categories: [] },
    ],
    explanation: "Operational controls are performed by people (guards, awareness training). Managerial controls are administrative policies and procedures. Physical controls limit physical access (generators, card readers, fencing). Technical controls are implemented by systems (firewalls, SIEM, encryption).",
  },
  {
    id: "pbq-b-match2",
    domain: "Identity and Access Management",
    title: "Match Authentication Factors",
    description: "Match each description with the correct authentication factor type.",
    type: "matching",
    matchingItems: [
      { source: "Phone receives a text with a one-time passcode", target: "Something you have" },
      { source: "Enter your PIN to make a deposit at ATM", target: "Something you know" },
      { source: "Fingerprint unlocks the data center door", target: "Something you are" },
      { source: "Login only works when connected to VPN", target: "Somewhere you are" },
    ],
    matchingTargets: ["Something you know", "Something you have", "Something you are", "Somewhere you are"],
    explanation: "Something you have = physical possession (phone, token). Something you know = knowledge factor (PIN, password). Something you are = biometric factor (fingerprint, face). Somewhere you are = location factor (VPN, geofencing).",
  },
  {
    id: "pbq-b-fw1",
    domain: "Firewall & ACL Configuration",
    title: "Configure Stateful Firewall Rules",
    description: "Configure firewall rules based on the network diagram. Block HTTP between Web Server and Database Server. Allow HTTPS from Storage to Video Server. Allow SSH from Management to File Server.",
    type: "firewall",
    firewallScenario: "DMZ: File Server (10.1.1.3), Video Server (10.1.1.7), Web Server (10.1.1.2). Internal: Storage Server (10.2.1.33), Management Server (10.2.1.47), Database Server (10.2.1.20). Create 3 rules to implement the required policies.",
    firewallRules: [
      { ruleId: 1, sourceIP: "10.1.1.2", destIP: "10.2.1.20", port: "80", protocol: "TCP", action: "" },
      { ruleId: 2, sourceIP: "10.2.1.33", destIP: "10.1.1.7", port: "443", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "10.2.1.47", destIP: "10.1.1.3", port: "22", protocol: "TCP", action: "" },
    ],
    correctActions: ["DENY", "ALLOW", "ALLOW"],
    explanation: "Rule 1 blocks HTTP (port 80) from the Web Server to the Database Server. Rule 2 allows HTTPS (port 443) from Storage to Video Server for file transfers. Rule 3 allows SSH (port 22) from Management to File Server for secure terminal access.",
  },
  {
    id: "pbq-b-class2",
    domain: "General Security Concepts",
    title: "Classify Control Types",
    description: "Classify each security control into its correct type.",
    type: "classification",
    classificationCategories: ["Preventive", "Detective", "Corrective", "Deterrent"],
    classificationItems: [
      { item: "Firewall blocking unauthorized access", category: "Preventive", categories: [] },
      { item: "Intrusion detection system alert", category: "Detective", categories: [] },
      { item: "Patching a known vulnerability", category: "Corrective", categories: [] },
      { item: "Login warning banner", category: "Deterrent", categories: [] },
      { item: "File integrity monitoring tool", category: "Detective", categories: [] },
      { item: "Multi-factor authentication requirement", category: "Preventive", categories: [] },
      { item: "Security camera in parking lot", category: "Deterrent", categories: [] },
      { item: "Restoring from backup after incident", category: "Corrective", categories: [] },
    ],
    explanation: "Preventive controls stop threats before they occur (firewalls, MFA). Detective controls identify threats that have occurred (IDS, FIM). Corrective controls fix issues after detection (patching, restoring backups). Deterrent controls discourage attacks (banners, cameras).",
  },
];

/* ========== SET C (additional variations) ========== */
const setC: PBQQuestion[] = [
  {
    id: "pbq-c-fw1",
    domain: "Firewall & ACL Configuration",
    title: "Secure Email Server Firewall Rules",
    description: "Configure firewall rules for an email server in the DMZ. Set each rule's action to ALLOW or DENY.",
    type: "firewall",
    firewallScenario: "The email server (172.16.1.10) must accept SMTP (port 25) and IMAPS (port 993) from the internet. POP3 (port 110) should be denied as it is unencrypted. Management access via SSH (port 22) should only come from the admin subnet (10.0.0.0/8). Telnet must be denied from all sources.",
    firewallRules: [
      { ruleId: 1, sourceIP: "Any", destIP: "172.16.1.10", port: "25", protocol: "TCP", action: "" },
      { ruleId: 2, sourceIP: "Any", destIP: "172.16.1.10", port: "993", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "Any", destIP: "172.16.1.10", port: "110", protocol: "TCP", action: "" },
      { ruleId: 4, sourceIP: "10.0.0.0/8", destIP: "172.16.1.10", port: "22", protocol: "TCP", action: "" },
      { ruleId: 5, sourceIP: "Any", destIP: "172.16.1.10", port: "23", protocol: "TCP", action: "" },
    ],
    correctActions: ["ALLOW", "ALLOW", "DENY", "ALLOW", "DENY"],
    explanation: "SMTP (25) is needed for email delivery. IMAPS (993) provides encrypted mailbox access. POP3 (110) is unencrypted and should be denied. SSH (22) from admin subnet only for management. Telnet (23) is always denied as it's insecure.",
  },
  {
    id: "pbq-c-match1",
    domain: "Network Security",
    title: "Match Protocols to Descriptions",
    description: "Drag each protocol to its correct description.",
    type: "matching",
    matchingItems: [
      { source: "RADIUS", target: "Centralized authentication for network devices" },
      { source: "SNMP", target: "Network device monitoring and management" },
      { source: "Syslog", target: "Centralized log collection" },
      { source: "IPSec", target: "Encrypted network-layer tunneling" },
      { source: "TLS", target: "Encrypted transport-layer communication" },
    ],
    matchingTargets: ["Centralized authentication for network devices", "Network device monitoring and management", "Centralized log collection", "Encrypted network-layer tunneling", "Encrypted transport-layer communication"],
    explanation: "RADIUS provides AAA for network access. SNMP monitors and manages network devices. Syslog collects logs centrally. IPSec encrypts at the network layer (VPNs). TLS encrypts at the transport layer (HTTPS, email).",
  },
  {
    id: "pbq-c-class1",
    domain: "Threats & Vulnerabilities",
    title: "Classify Threat Actor Types",
    description: "Classify each scenario into the correct threat actor category.",
    type: "classification",
    classificationCategories: ["Nation State", "Organized Crime", "Hacktivist", "Insider Threat"],
    classificationItems: [
      { item: "APT group targets defense contractors for years", category: "Nation State", categories: [] },
      { item: "Ransomware gang demands Bitcoin payment", category: "Organized Crime", categories: [] },
      { item: "Website defaced with political message", category: "Hacktivist", categories: [] },
      { item: "Employee copies customer database before quitting", category: "Insider Threat", categories: [] },
      { item: "State-sponsored espionage on critical infrastructure", category: "Nation State", categories: [] },
      { item: "Credit card skimming ring at retail stores", category: "Organized Crime", categories: [] },
    ],
    explanation: "Nation states conduct APTs and espionage with vast resources. Organized crime seeks financial gain through ransomware and fraud. Hacktivists deface sites for political causes. Insider threats come from employees with authorized access.",
  },
  {
    id: "pbq-c-match2",
    domain: "Cryptography",
    title: "Match Encryption Concepts",
    description: "Match each cryptographic concept to its correct definition.",
    type: "matching",
    matchingItems: [
      { source: "Key Escrow", target: "Third-party holds copy of encryption keys" },
      { source: "Digital Signature", target: "Provides authenticity and non-repudiation" },
      { source: "Salting", target: "Random data added before hashing passwords" },
      { source: "Steganography", target: "Hiding data within other media files" },
      { source: "PKI", target: "Framework for managing digital certificates" },
    ],
    matchingTargets: ["Third-party holds copy of encryption keys", "Provides authenticity and non-repudiation", "Random data added before hashing passwords", "Hiding data within other media files", "Framework for managing digital certificates"],
    explanation: "Key escrow stores keys with a trusted third party for recovery. Digital signatures use the sender's private key for authenticity. Salting adds randomness to prevent rainbow table attacks. Steganography hides data inside images/audio. PKI manages certificate lifecycle.",
  },
  {
    id: "pbq-c-place1",
    domain: "Security Architecture",
    title: "Place Security Tools in Defense Layers",
    description: "Drag each security tool to the correct defense-in-depth layer.",
    type: "placement",
    placementZones: ["Perimeter", "Network", "Endpoint", "Application"],
    placementItems: [
      { item: "Border Firewall", correctZone: "Perimeter", zones: [] },
      { item: "VPN Gateway", correctZone: "Perimeter", zones: [] },
      { item: "Network Segmentation (VLANs)", correctZone: "Network", zones: [] },
      { item: "Antivirus / EDR Agent", correctZone: "Endpoint", zones: [] },
      { item: "Input Validation Library", correctZone: "Application", zones: [] },
      { item: "Network Access Control (NAC)", correctZone: "Network", zones: [] },
    ],
    explanation: "Perimeter defenses (firewalls, VPN gateways) protect the network boundary. Network layer controls (VLANs, NAC) segment and restrict internal traffic. Endpoint protection (AV/EDR) secures individual devices. Application layer controls (input validation) protect software from attacks.",
  },
  {
    id: "pbq-c-fw2",
    domain: "Firewall & ACL Configuration",
    title: "Secure Remote Access Rules",
    description: "Configure firewall rules for a company allowing remote VPN access. Set each rule's action to ALLOW or DENY.",
    type: "firewall",
    firewallScenario: "The VPN concentrator (10.0.0.1) must accept connections on port 1194 (OpenVPN) and port 443 (SSL VPN) from any source. Direct RDP (port 3389) from the internet must be denied. Internal DNS (port 53) should be allowed only from the VPN subnet (10.8.0.0/24). FTP (port 21) must be denied from all external sources.",
    firewallRules: [
      { ruleId: 1, sourceIP: "Any", destIP: "10.0.0.1", port: "1194", protocol: "UDP", action: "" },
      { ruleId: 2, sourceIP: "Any", destIP: "10.0.0.1", port: "443", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "Any", destIP: "Any", port: "3389", protocol: "TCP", action: "" },
      { ruleId: 4, sourceIP: "10.8.0.0/24", destIP: "10.0.0.53", port: "53", protocol: "UDP", action: "" },
      { ruleId: 5, sourceIP: "Any", destIP: "Any", port: "21", protocol: "TCP", action: "" },
    ],
    correctActions: ["ALLOW", "ALLOW", "DENY", "ALLOW", "DENY"],
    explanation: "OpenVPN (1194/UDP) and SSL VPN (443/TCP) must be allowed for remote access. RDP (3389) from the internet is a major security risk and must be denied. DNS (53) is allowed only from VPN clients. FTP (21) transmits credentials in cleartext and must be denied.",
  },
];

export const pbqSets: PBQSet[] = [
  { id: 'A', label: 'Set A', questions: setA },
  { id: 'B', label: 'Set B', questions: setB },
  { id: 'C', label: 'Set C', questions: setC },
];

// Default export for backward compat
export const pbqQuestions = setA;
