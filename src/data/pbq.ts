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

export interface PBQOrderItem {
  step: string;
  correctPosition: number;
}

export interface PBQQuestion {
  id: string;
  domain: string;
  title: string;
  description: string;
  type: 'firewall' | 'matching' | 'classification' | 'placement' | 'ordering';
  firewallRules?: PBQFirewallRule[];
  firewallScenario?: string;
  correctActions?: string[];
  matchingItems?: PBQMatchingItem[];
  matchingTargets?: string[];
  classificationItems?: PBQClassificationItem[];
  classificationCategories?: string[];
  placementItems?: PBQPlacementItem[];
  placementZones?: string[];
  orderItems?: PBQOrderItem[];
  explanation?: string;
}

export interface PBQSet {
  id: string;
  label: string;
  questions: PBQQuestion[];
}

/* ========== SET A ========== */
const setA: PBQQuestion[] = [
  // 1. Firewall - DMZ Web Server
  {
    id: "pbq-a-fw1",
    domain: "Firewall & ACL Configuration",
    title: "Configure DMZ Firewall Rules",
    description: "A company hosts a public web server in a DMZ. Configure the firewall rules to allow only necessary traffic.",
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
  // 2. Matching - Cryptographic Algorithms
  {
    id: "pbq-a-match1",
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
  // 3. Classification - Security Control Types
  {
    id: "pbq-a-class1",
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
  // 4. Ordering - Incident Response Steps
  {
    id: "pbq-a-order1",
    domain: "Incident Response",
    title: "Order Incident Response Steps",
    description: "Drag-and-drop the incident response steps into the correct order according to NIST SP 800-61.",
    type: "ordering",
    orderItems: [
      { step: "Preparation", correctPosition: 0 },
      { step: "Detection & Identification", correctPosition: 1 },
      { step: "Containment", correctPosition: 2 },
      { step: "Eradication", correctPosition: 3 },
      { step: "Recovery", correctPosition: 4 },
      { step: "Lessons Learned", correctPosition: 5 },
    ],
    explanation: "The NIST incident response lifecycle: Preparation establishes policies and tools. Detection identifies incidents. Containment limits damage. Eradication removes the threat. Recovery restores systems. Lessons Learned documents improvements.",
  },
  // 5. Placement - Cloud Security Controls
  {
    id: "pbq-a-place1",
    domain: "Cloud Security",
    title: "Place Cloud Security Controls",
    description: "Drag each security control to its correct cloud deployment layer.",
    type: "placement",
    placementZones: ["Identity & Access", "Network", "Data", "Application"],
    placementItems: [
      { item: "Multi-Factor Authentication (MFA)", correctZone: "Identity & Access", zones: [] },
      { item: "Cloud Access Security Broker (CASB)", correctZone: "Network", zones: [] },
      { item: "Encryption at Rest (AES-256)", correctZone: "Data", zones: [] },
      { item: "Web Application Firewall (WAF)", correctZone: "Application", zones: [] },
      { item: "Conditional Access Policies", correctZone: "Identity & Access", zones: [] },
      { item: "TLS 1.3 for Data in Transit", correctZone: "Network", zones: [] },
    ],
    explanation: "MFA and conditional access protect identity. CASB and TLS protect network communications. Encryption at rest protects stored data. WAF protects web applications from attacks like SQLi and XSS.",
  },
  // 6. Matching - VPN & Remote Access
  {
    id: "pbq-a-match2",
    domain: "VPN & Remote Access",
    title: "Match VPN Protocols to Descriptions",
    description: "Match each VPN/remote access protocol to its correct description.",
    type: "matching",
    matchingItems: [
      { source: "IPSec (IKEv2)", target: "Network-layer VPN with strong authentication" },
      { source: "SSL/TLS VPN", target: "Application-layer VPN via web browser" },
      { source: "WireGuard", target: "Modern lightweight VPN with minimal code" },
      { source: "L2TP", target: "Layer 2 tunneling often paired with IPSec" },
      { source: "PPTP", target: "Legacy VPN protocol with known vulnerabilities" },
    ],
    matchingTargets: ["Network-layer VPN with strong authentication", "Application-layer VPN via web browser", "Modern lightweight VPN with minimal code", "Layer 2 tunneling often paired with IPSec", "Legacy VPN protocol with known vulnerabilities"],
    explanation: "IPSec/IKEv2 operates at the network layer with strong crypto. SSL VPN works through browsers. WireGuard is a modern, efficient protocol. L2TP tunnels at Layer 2 and needs IPSec for encryption. PPTP is outdated and insecure.",
  },
  // 7. Classification - Malware Types
  {
    id: "pbq-a-class2",
    domain: "Threats & Vulnerabilities",
    title: "Classify Indicators of Malware-Based Attacks",
    description: "Classify each indicator into the correct malware category.",
    type: "classification",
    classificationCategories: ["Ransomware", "Trojan", "Worm", "Rootkit"],
    classificationItems: [
      { item: "Files encrypted, ransom note displayed", category: "Ransomware", categories: [] },
      { item: "Legitimate-looking app installs backdoor", category: "Trojan", categories: [] },
      { item: "Self-propagates across network shares", category: "Worm", categories: [] },
      { item: "Hides processes from task manager", category: "Rootkit", categories: [] },
      { item: "Demands Bitcoin payment for decryption key", category: "Ransomware", categories: [] },
      { item: "Spreads via email attachments automatically", category: "Worm", categories: [] },
    ],
    explanation: "Ransomware encrypts files and demands payment. Trojans disguise as legitimate software. Worms self-replicate without user interaction. Rootkits hide malicious activity at the OS level.",
  },
  // 8. Firewall - VPN Concentrator
  {
    id: "pbq-a-fw2",
    domain: "VPN & Remote Access",
    title: "Secure VPN Concentrator Rules",
    description: "Configure firewall rules for a company's VPN concentrator. Set each rule's action to ALLOW or DENY.",
    type: "firewall",
    firewallScenario: "The VPN concentrator (10.0.0.1) must accept OpenVPN (port 1194/UDP) and SSL VPN (port 443/TCP) from any source. Direct RDP (port 3389) from the internet must be denied. Internal DNS (port 53) should be allowed only from VPN clients (10.8.0.0/24). FTP (port 21) must be denied from all sources.",
    firewallRules: [
      { ruleId: 1, sourceIP: "Any", destIP: "10.0.0.1", port: "1194", protocol: "UDP", action: "" },
      { ruleId: 2, sourceIP: "Any", destIP: "10.0.0.1", port: "443", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "Any", destIP: "Any", port: "3389", protocol: "TCP", action: "" },
      { ruleId: 4, sourceIP: "10.8.0.0/24", destIP: "10.0.0.53", port: "53", protocol: "UDP", action: "" },
      { ruleId: 5, sourceIP: "Any", destIP: "Any", port: "21", protocol: "TCP", action: "" },
    ],
    correctActions: ["ALLOW", "ALLOW", "DENY", "ALLOW", "DENY"],
    explanation: "OpenVPN (1194/UDP) and SSL VPN (443/TCP) must be allowed for remote access. RDP (3389) from the internet is a major security risk. DNS (53) is allowed only from VPN clients. FTP (21) transmits credentials in cleartext.",
  },
  // 9. Placement - Nmap & tcpdump Tool Usage
  {
    id: "pbq-a-place2",
    domain: "Network Reconnaissance",
    title: "Match Reconnaissance Commands to Goals",
    description: "Drag each command to its correct reconnaissance objective.",
    type: "placement",
    placementZones: ["Port Scanning", "Service Detection", "Packet Capture", "OS Fingerprinting"],
    placementItems: [
      { item: "nmap -sS 192.168.1.0/24", correctZone: "Port Scanning", zones: [] },
      { item: "nmap -sV -p 80,443 target", correctZone: "Service Detection", zones: [] },
      { item: "tcpdump -i eth0 port 443", correctZone: "Packet Capture", zones: [] },
      { item: "nmap -O target", correctZone: "OS Fingerprinting", zones: [] },
      { item: "tcpdump -w capture.pcap", correctZone: "Packet Capture", zones: [] },
      { item: "nmap -sS -p 1-1024 target", correctZone: "Port Scanning", zones: [] },
    ],
    explanation: "nmap -sS performs SYN (stealth) port scans. nmap -sV detects service versions. nmap -O fingerprints the operating system. tcpdump captures raw network packets for analysis.",
  },
  // 10. Classification - HTTP & Scripting Attacks
  {
    id: "pbq-a-class3",
    domain: "Application Security",
    title: "Classify Web Application Attacks",
    description: "Classify each attack scenario into the correct web attack category.",
    type: "classification",
    classificationCategories: ["SQL Injection", "Cross-Site Scripting (XSS)", "CSRF", "Directory Traversal"],
    classificationItems: [
      { item: "Input: ' OR 1=1 -- in login form", category: "SQL Injection", categories: [] },
      { item: "Malicious <script> tag in forum post", category: "Cross-Site Scripting (XSS)", categories: [] },
      { item: "Hidden form auto-submits bank transfer", category: "CSRF", categories: [] },
      { item: "URL contains ../../etc/passwd", category: "Directory Traversal", categories: [] },
      { item: "UNION SELECT from users table", category: "SQL Injection", categories: [] },
      { item: "Reflected script in search parameter", category: "Cross-Site Scripting (XSS)", categories: [] },
    ],
    explanation: "SQL injection manipulates database queries. XSS injects scripts into web pages. CSRF forces authenticated users to perform unwanted actions. Directory traversal accesses files outside the web root.",
  },
];

/* ========== SET B ========== */
const setB: PBQQuestion[] = [
  // 1. Matching - Attack Types (Messer Exam A)
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
  // 2. Placement - Physical Security Controls (Messer Exam A)
  {
    id: "pbq-b-place1",
    domain: "Security Architecture",
    title: "Place Physical Security Controls at Locations",
    description: "Select the BEST security control for each location.",
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
    explanation: "Outside areas need fencing and lighting for safety. Reception requires guards and vestibules to manage entry. Data center doors need badge + biometric authentication. Server consoles require multi-factor authentication.",
  },
  // 3. Classification - Control Types (Preventive/Detective/etc.)
  {
    id: "pbq-b-class1",
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
  // 4. Ordering - Vulnerability Management Lifecycle
  {
    id: "pbq-b-order1",
    domain: "Security Operations",
    title: "Order Vulnerability Management Steps",
    description: "Arrange the vulnerability management steps in the correct order.",
    type: "ordering",
    orderItems: [
      { step: "Asset Discovery & Inventory", correctPosition: 0 },
      { step: "Vulnerability Scanning", correctPosition: 1 },
      { step: "Risk Assessment (CVSS Scoring)", correctPosition: 2 },
      { step: "Prioritization & Remediation Planning", correctPosition: 3 },
      { step: "Patch Deployment / Mitigation", correctPosition: 4 },
      { step: "Validation & Rescanning", correctPosition: 5 },
    ],
    explanation: "First discover all assets. Scan for vulnerabilities. Assess risk using CVSS scores. Prioritize based on risk and asset criticality. Deploy patches or mitigations. Validate fixes by rescanning.",
  },
  // 5. Matching - Wi-Fi Security
  {
    id: "pbq-b-match2",
    domain: "Network Security",
    title: "Match Wi-Fi Security Standards",
    description: "Match each Wi-Fi security standard to its correct description.",
    type: "matching",
    matchingItems: [
      { source: "WPA3-Enterprise", target: "192-bit security with 802.1X authentication" },
      { source: "WPA2-PSK", target: "Pre-shared key with AES-CCMP encryption" },
      { source: "WPA3-SAE", target: "Simultaneous Authentication of Equals for personal use" },
      { source: "WEP", target: "Deprecated protocol with RC4 stream cipher" },
      { source: "802.1X", target: "Port-based network access control framework" },
    ],
    matchingTargets: ["192-bit security with 802.1X authentication", "Pre-shared key with AES-CCMP encryption", "Simultaneous Authentication of Equals for personal use", "Deprecated protocol with RC4 stream cipher", "Port-based network access control framework"],
    explanation: "WPA3-Enterprise provides the strongest security with 192-bit mode. WPA2-PSK uses a shared passphrase with AES. WPA3-SAE replaces PSK with a more secure handshake. WEP is broken and should never be used. 802.1X provides the authentication framework.",
  },
  // 6. Firewall - Stateful Rules (Messer Exam A)
  {
    id: "pbq-b-fw1",
    domain: "Firewall & ACL Configuration",
    title: "Configure Stateful Firewall Rules",
    description: "Block HTTP between Web Server and Database Server. Allow HTTPS from Storage to Video Server. Allow SSH from Management to File Server.",
    type: "firewall",
    firewallScenario: "DMZ: File Server (10.1.1.3), Video Server (10.1.1.7), Web Server (10.1.1.2). Internal: Storage Server (10.2.1.33), Management Server (10.2.1.47), Database Server (10.2.1.20).",
    firewallRules: [
      { ruleId: 1, sourceIP: "10.1.1.2", destIP: "10.2.1.20", port: "80", protocol: "TCP", action: "" },
      { ruleId: 2, sourceIP: "10.2.1.33", destIP: "10.1.1.7", port: "443", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "10.2.1.47", destIP: "10.1.1.3", port: "22", protocol: "TCP", action: "" },
    ],
    correctActions: ["DENY", "ALLOW", "ALLOW"],
    explanation: "Rule 1 blocks HTTP (port 80) from the Web Server to the Database Server. Rule 2 allows HTTPS (port 443) from Storage to Video Server. Rule 3 allows SSH (port 22) from Management to File Server.",
  },
  // 7. Placement - MDM Security Features
  {
    id: "pbq-b-place2",
    domain: "Mobile Device Management",
    title: "Map MDM Security Features",
    description: "Drag each MDM feature to its correct security objective.",
    type: "placement",
    placementZones: ["Device Control", "Data Protection", "Access Control", "Monitoring"],
    placementItems: [
      { item: "Remote Wipe", correctZone: "Data Protection", zones: [] },
      { item: "Screen Lock Timeout", correctZone: "Device Control", zones: [] },
      { item: "Geofencing Restrictions", correctZone: "Access Control", zones: [] },
      { item: "Application Allowlist", correctZone: "Device Control", zones: [] },
      { item: "Containerization (Work Profile)", correctZone: "Data Protection", zones: [] },
      { item: "GPS Location Tracking", correctZone: "Monitoring", zones: [] },
    ],
    explanation: "Remote wipe and containerization protect data. Screen lock and app allowlists control the device. Geofencing restricts access by location. GPS tracking enables monitoring and recovery.",
  },
  // 8. Classification - Log/SIEM Analysis
  {
    id: "pbq-b-class2",
    domain: "Security Operations",
    title: "Classify Security Log Indicators",
    description: "Given each log entry indicator, classify the likely attack type.",
    type: "classification",
    classificationCategories: ["Brute Force", "SQL Injection", "DDoS", "Privilege Escalation"],
    classificationItems: [
      { item: "445 failed password attempts from single IP for root", category: "Brute Force", categories: [] },
      { item: "' OR '1'='1 in web server access log query string", category: "SQL Injection", categories: [] },
      { item: "10,000 SYN packets/sec from 200+ source IPs", category: "DDoS", categories: [] },
      { item: "User account suddenly added to Domain Admins group", category: "Privilege Escalation", categories: [] },
      { item: "UNION SELECT in HTTP POST body parameter", category: "SQL Injection", categories: [] },
      { item: "100 failed SSH logins followed by successful login", category: "Brute Force", categories: [] },
    ],
    explanation: "Multiple failed login attempts indicate brute force. SQL syntax in web logs indicates injection. Massive traffic from many IPs indicates DDoS. Unexpected group membership changes indicate privilege escalation.",
  },
  // 9. Matching - Authentication Factors
  {
    id: "pbq-b-match3",
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
    explanation: "Something you have = physical possession (phone, token). Something you know = knowledge factor (PIN, password). Something you are = biometric (fingerprint). Somewhere you are = location factor (VPN, geofencing).",
  },
  // 10. Placement - User/Permission Hardening
  {
    id: "pbq-b-place3",
    domain: "Identity and Access Management",
    title: "Apply Least Privilege to User Accounts",
    description: "Given the user directory, assign the correct access level for each account based on least privilege.",
    type: "placement",
    placementZones: ["Disable Account", "Read-Only Access", "Standard User", "Administrator"],
    placementItems: [
      { item: "Former contractor (left 2 weeks ago)", correctZone: "Disable Account", zones: [] },
      { item: "Auditor reviewing quarterly reports", correctZone: "Read-Only Access", zones: [] },
      { item: "Help desk technician", correctZone: "Standard User", zones: [] },
      { item: "IT Security Manager", correctZone: "Administrator", zones: [] },
      { item: "Intern (access to training materials only)", correctZone: "Read-Only Access", zones: [] },
      { item: "Generic 'admin' account with no assigned owner", correctZone: "Disable Account", zones: [] },
    ],
    explanation: "Former contractors and unassigned generic accounts should be disabled immediately. Auditors and interns need read-only access. Help desk gets standard user rights. Only security managers need admin privileges.",
  },
];

/* ========== SET C ========== */
const setC: PBQQuestion[] = [
  // 1. Firewall - Email Server
  {
    id: "pbq-c-fw1",
    domain: "Firewall & ACL Configuration",
    title: "Secure Email Server Firewall Rules",
    description: "Configure firewall rules for an email server in the DMZ.",
    type: "firewall",
    firewallScenario: "The email server (172.16.1.10) must accept SMTP (port 25) and IMAPS (port 993) from the internet. POP3 (port 110) should be denied as it is unencrypted. SSH (port 22) should only come from the admin subnet (10.0.0.0/8). Telnet must be denied.",
    firewallRules: [
      { ruleId: 1, sourceIP: "Any", destIP: "172.16.1.10", port: "25", protocol: "TCP", action: "" },
      { ruleId: 2, sourceIP: "Any", destIP: "172.16.1.10", port: "993", protocol: "TCP", action: "" },
      { ruleId: 3, sourceIP: "Any", destIP: "172.16.1.10", port: "110", protocol: "TCP", action: "" },
      { ruleId: 4, sourceIP: "10.0.0.0/8", destIP: "172.16.1.10", port: "22", protocol: "TCP", action: "" },
      { ruleId: 5, sourceIP: "Any", destIP: "172.16.1.10", port: "23", protocol: "TCP", action: "" },
    ],
    correctActions: ["ALLOW", "ALLOW", "DENY", "ALLOW", "DENY"],
    explanation: "SMTP (25) is needed for email delivery. IMAPS (993) provides encrypted mailbox access. POP3 (110) is unencrypted. SSH (22) from admin subnet only. Telnet (23) is always insecure.",
  },
  // 2. Matching - Network Protocols
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
    explanation: "RADIUS provides AAA for network access. SNMP monitors network devices. Syslog collects logs centrally. IPSec encrypts at the network layer. TLS encrypts at the transport layer.",
  },
  // 3. Classification - Threat Actors
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
    explanation: "Nation states conduct APTs and espionage. Organized crime seeks financial gain. Hacktivists deface sites for political causes. Insider threats come from employees with authorized access.",
  },
  // 4. Matching - Encryption Concepts
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
    explanation: "Key escrow stores keys with a trusted third party. Digital signatures use the sender's private key for authenticity. Salting adds randomness to prevent rainbow table attacks. Steganography hides data inside images/audio. PKI manages certificate lifecycle.",
  },
  // 5. Ordering - Wi-Fi/VPN Configuration Steps
  {
    id: "pbq-c-order1",
    domain: "Network Security",
    title: "Order Secure Wi-Fi Deployment Steps",
    description: "Arrange the steps for deploying a secure enterprise wireless network in the correct order.",
    type: "ordering",
    orderItems: [
      { step: "Perform site survey and plan AP placement", correctPosition: 0 },
      { step: "Configure SSID and disable SSID broadcast (optional)", correctPosition: 1 },
      { step: "Select WPA3-Enterprise with EAP-TLS", correctPosition: 2 },
      { step: "Configure RADIUS server for 802.1X authentication", correctPosition: 3 },
      { step: "Deploy client certificates to authorized devices", correctPosition: 4 },
      { step: "Test connectivity and validate security controls", correctPosition: 5 },
    ],
    explanation: "Start with a physical site survey. Configure the SSID. Choose the strongest encryption (WPA3-Enterprise). Set up RADIUS for 802.1X. Deploy certificates for mutual authentication. Finally, test and validate.",
  },
  // 6. Placement - Defense-in-Depth Layers
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
    explanation: "Perimeter defenses (firewalls, VPN gateways) protect the network boundary. Network layer controls (VLANs, NAC) segment internal traffic. Endpoint protection (AV/EDR) secures devices. Application layer controls (input validation) protect software.",
  },
  // 7. Firewall - VLAN Segmentation
  {
    id: "pbq-c-fw2",
    domain: "Firewall & ACL Configuration",
    title: "Segment Internal Network Traffic",
    description: "Configure rules to properly segment traffic between HR, Finance, and Engineering VLANs.",
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
    explanation: "HR needs file sharing access to Finance (port 445). Engineering must be isolated from HR and Finance. DNS is shared. Finance should not have blanket access to HR.",
  },
  // 8. Classification - Vulnerability Management Priorities
  {
    id: "pbq-c-class2",
    domain: "Security Operations",
    title: "Prioritize Vulnerability Remediation",
    description: "Given scan results, classify each vulnerability by remediation priority based on CVSS score and asset criticality.",
    type: "classification",
    classificationCategories: ["Critical (Fix Immediately)", "High (Fix Within 24h)", "Medium (Fix Within 7 Days)", "Low (Schedule for Next Cycle)"],
    classificationItems: [
      { item: "CVSS 9.8 RCE on internet-facing web server", category: "Critical (Fix Immediately)", categories: [] },
      { item: "CVSS 7.5 privilege escalation on internal DB", category: "High (Fix Within 24h)", categories: [] },
      { item: "CVSS 5.3 info disclosure on dev environment", category: "Low (Schedule for Next Cycle)", categories: [] },
      { item: "CVSS 8.1 SQLi on customer portal", category: "Critical (Fix Immediately)", categories: [] },
      { item: "CVSS 6.1 XSS on internal wiki", category: "Medium (Fix Within 7 Days)", categories: [] },
      { item: "CVSS 4.3 missing security headers on staging", category: "Low (Schedule for Next Cycle)", categories: [] },
    ],
    explanation: "Critical CVSS scores on internet-facing assets need immediate fixes. High scores on internal systems need quick remediation. Medium scores on internal tools can wait a week. Low scores on dev/staging can be scheduled.",
  },
  // 9. Matching - Ports to Services
  {
    id: "pbq-c-match3",
    domain: "Network Security",
    title: "Match Ports to Services",
    description: "Drag each well-known port to the correct network service.",
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
  // 10. Placement - Cloud Security Responsibility
  {
    id: "pbq-c-place2",
    domain: "Cloud Security",
    title: "Assign Cloud Responsibility (Shared Model)",
    description: "Drag each responsibility to the correct party in the IaaS shared responsibility model.",
    type: "placement",
    placementZones: ["Cloud Provider", "Customer", "Shared"],
    placementItems: [
      { item: "Physical data center security", correctZone: "Cloud Provider", zones: [] },
      { item: "OS patching on virtual machines", correctZone: "Customer", zones: [] },
      { item: "Network infrastructure", correctZone: "Cloud Provider", zones: [] },
      { item: "Application-level firewall rules", correctZone: "Customer", zones: [] },
      { item: "Identity and access management", correctZone: "Shared", zones: [] },
      { item: "Data encryption configuration", correctZone: "Customer", zones: [] },
    ],
    explanation: "In IaaS, the provider secures the physical infrastructure and network. The customer is responsible for OS patches, app firewalls, and data encryption. Identity management is shared between both parties.",
  },
];

export const pbqSets: PBQSet[] = [
  { id: 'A', label: 'Set A', questions: setA },
  { id: 'B', label: 'Set B', questions: setB },
  { id: 'C', label: 'Set C', questions: setC },
];

export const pbqQuestions = setA;

// Get all unique domains across all sets
export function getAllPBQDomains(): string[] {
  const domains = new Set<string>();
  pbqSets.forEach(set => set.questions.forEach(q => domains.add(q.domain)));
  return Array.from(domains).sort();
}
