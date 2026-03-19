export interface MCQItem {
  id: string;
  domain: string;
  question: string;
  type: 'single' | 'multiple';
  options: string[];
  answer: number | number[];
  explanation: string;
}

export interface MCQSet {
  id: string;
  label: string;
  questions: MCQItem[];
}

/* ========== SET A ========== */
const setA: MCQItem[] = [
  {
    id: "a1", domain: "Identity and Access Management",
    question: "Which MFA method provides the strongest resistance to phishing?",
    type: "single",
    options: ["SMS OTP", "Email OTP", "Hardware FIDO2 security key", "Push notification"],
    answer: 2,
    explanation: "FIDO2/WebAuthn hardware security keys use cryptographic challenge-response bound to the origin, making them immune to phishing."
  },
  {
    id: "a2", domain: "Identity and Access Management",
    question: "Which access control model uses labels such as 'Top Secret' and 'Confidential'?",
    type: "single",
    options: ["RBAC", "MAC", "DAC", "ABAC"],
    answer: 1,
    explanation: "MAC uses classification labels assigned by administrators. Users cannot change permissions."
  },
  {
    id: "a3", domain: "Firewall & ACL Configuration",
    question: "Select all ports that should be allowed inbound to a web server in a DMZ.",
    type: "multiple",
    options: ["22 (SSH)", "80 (HTTP)", "443 (HTTPS)", "3306 (MySQL)"],
    answer: [1, 2],
    explanation: "Only HTTP (80) and HTTPS (443) should be exposed inbound to a DMZ web server."
  },
  {
    id: "a4", domain: "Cryptography",
    question: "Which algorithm is an asymmetric encryption algorithm?",
    type: "single",
    options: ["AES-256", "RSA", "SHA-256", "3DES"],
    answer: 1,
    explanation: "RSA is an asymmetric (public-key) algorithm. AES and 3DES are symmetric; SHA-256 is hashing."
  },
  {
    id: "a5", domain: "Cryptography",
    question: "Which of the following are hashing algorithms? (Select all that apply)",
    type: "multiple",
    options: ["MD5", "AES", "SHA-256", "RSA"],
    answer: [0, 2],
    explanation: "MD5 and SHA-256 are hashing algorithms. AES is symmetric encryption and RSA is asymmetric encryption."
  },
  {
    id: "a6", domain: "Network Security",
    question: "What is the primary purpose of a VLAN?",
    type: "single",
    options: ["Encrypt network traffic", "Segment broadcast domains", "Provide wireless access", "Monitor network traffic"],
    answer: 1,
    explanation: "VLANs logically segment a physical network into separate broadcast domains."
  },
  {
    id: "a7", domain: "Network Security",
    question: "Which protocol is used to securely access a remote command line?",
    type: "single",
    options: ["Telnet", "FTP", "SSH", "SNMP"],
    answer: 2,
    explanation: "SSH encrypts the session for remote CLI access. Telnet transmits in cleartext."
  },
  {
    id: "a8", domain: "Threats & Vulnerabilities",
    question: "What type of attack involves an attacker inserting themselves between two communicating parties?",
    type: "single",
    options: ["Phishing", "On-path (Man-in-the-Middle)", "SQL Injection", "Cross-Site Scripting"],
    answer: 1,
    explanation: "An on-path (MitM) attack positions the attacker between two parties to intercept communications."
  },
  {
    id: "a9", domain: "Threats & Vulnerabilities",
    question: "Which of the following are social engineering techniques? (Select all that apply)",
    type: "multiple",
    options: ["Pretexting", "Buffer overflow", "Tailgating", "SQL injection"],
    answer: [0, 2],
    explanation: "Pretexting and tailgating are social engineering. Buffer overflow and SQL injection are technical attacks."
  },
  {
    id: "a10", domain: "Incident Response",
    question: "What is the first step in the incident response process?",
    type: "single",
    options: ["Containment", "Eradication", "Preparation", "Identification"],
    answer: 2,
    explanation: "Preparation is the first phase of incident response (NIST SP 800-61)."
  },
  {
    id: "a11", domain: "Security Operations",
    question: "Which log source would be MOST useful for detecting unauthorized login attempts?",
    type: "single",
    options: ["Firewall logs", "Authentication server logs", "DNS logs", "DHCP logs"],
    answer: 1,
    explanation: "Authentication server logs record all login attempts, making them the best source for detecting brute force."
  },
  {
    id: "a12", domain: "Security Architecture",
    question: "Which security concept ensures a user has only the minimum permissions needed?",
    type: "single",
    options: ["Separation of duties", "Least privilege", "Defense in depth", "Zero trust"],
    answer: 1,
    explanation: "Least privilege limits access rights to the bare minimum for the user's role."
  },
  {
    id: "a13", domain: "Cloud Security",
    question: "In an IaaS shared responsibility model, who is responsible for OS patching?",
    type: "single",
    options: ["Cloud provider", "Customer", "Both equally", "Neither — it's automated"],
    answer: 1,
    explanation: "In IaaS, the customer is responsible for OS patching on their virtual machines."
  },
  {
    id: "a14", domain: "Governance & Compliance",
    question: "Which regulation specifically protects the privacy of health information in the United States?",
    type: "single",
    options: ["GDPR", "PCI-DSS", "HIPAA", "SOX"],
    answer: 2,
    explanation: "HIPAA establishes standards for protecting sensitive patient health information."
  },
  {
    id: "a15", domain: "Mobile Device Management",
    question: "A company needs mobile devices auto-locked after timeout, GPS tracking, and user/company data separation. What implements this?",
    type: "single",
    options: ["Network segmentation", "Biometrics", "COPE deployment", "MDM solution"],
    answer: 3,
    explanation: "MDM provides centralized control including auto-lock policies, location tracking, and data containerization."
  },
];

/* ========== SET B ========== */
const setB: MCQItem[] = [
  {
    id: "b1", domain: "Security Operations",
    question: "A company hired a third-party to gather information without direct internal network access. Which describes this?",
    type: "single",
    options: ["Vulnerability scanning", "Passive reconnaissance", "Supply chain analysis", "Regulatory audit"],
    answer: 1,
    explanation: "Passive reconnaissance gathers information from publicly available sources without interacting with target systems."
  },
  {
    id: "b2", domain: "Network Security",
    question: "A company's email server received email from a server not on the authorized list. Which determines disposition?",
    type: "single",
    options: ["SPF", "NAC", "DMARC", "DKIM"],
    answer: 2,
    explanation: "DMARC determines the disposition of messages that fail SPF and/or DKIM checks."
  },
  {
    id: "b3", domain: "Threats & Vulnerabilities",
    question: "Which threat actor would be MOST likely to attack for direct financial gain?",
    type: "single",
    options: ["Organized crime", "Hacktivist", "Nation state", "Shadow IT"],
    answer: 0,
    explanation: "Organized crime groups are primarily motivated by financial gain."
  },
  {
    id: "b4", domain: "Security Architecture",
    question: "A city is building an ambulance dispatch network. Which should have the highest priority?",
    type: "single",
    options: ["Integration costs", "Patch availability", "System availability", "Power usage"],
    answer: 2,
    explanation: "For emergency services, system availability is the highest priority."
  },
  {
    id: "b5", domain: "Security Operations",
    question: "An administrator needs to know how often firewall hardware is expected to fail. Which metric?",
    type: "single",
    options: ["MTBF", "RTO", "MTTR", "RPO"],
    answer: 0,
    explanation: "MTBF (Mean Time Between Failures) measures expected time between hardware failures."
  },
  {
    id: "b6", domain: "Threats & Vulnerabilities",
    question: "An attacker calls a help desk pretending to be a director, requesting a password reset. What type of attack?",
    type: "single",
    options: ["Social engineering", "Supply chain", "Watering hole", "On-path"],
    answer: 0,
    explanation: "Social engineering manipulates people into performing actions or divulging information."
  },
  {
    id: "b7", domain: "Governance & Compliance",
    question: "Two companies want to qualify their partnership with a broad formal agreement. Which describes this?",
    type: "single",
    options: ["SLA", "SOW", "MOA", "NDA"],
    answer: 2,
    explanation: "A Memorandum of Agreement (MOA) is a broad formal agreement between organizations."
  },
  {
    id: "b8", domain: "Identity and Access Management",
    question: "A password policy lacks attempt restrictions and doesn't require periodic changes. Which TWO fix this?",
    type: "multiple",
    options: ["Password complexity", "Password expiration", "Password reuse", "Account lockout", "Password managers"],
    answer: [1, 3],
    explanation: "Password expiration requires periodic changes; account lockout limits failed login attempts."
  },
  {
    id: "b9", domain: "Security Architecture",
    question: "A company wants to examine credentials of each person entering the data center. What facilitates this?",
    type: "single",
    options: ["Access control vestibule", "Video surveillance", "Pressure sensors", "Bollards"],
    answer: 0,
    explanation: "An access control vestibule forces individuals to authenticate before proceeding."
  },
  {
    id: "b10", domain: "Security Operations",
    question: "A vulnerability scan shows no issues for Windows servers, but a significant vulnerability was announced last week. What describes this?",
    type: "single",
    options: ["Exploit", "Compensating controls", "Zero-day attack", "False negative"],
    answer: 3,
    explanation: "A false negative occurs when a scanner fails to detect a known vulnerability."
  },
  {
    id: "b11", domain: "Network Security",
    question: "Users are directed to a different IP than the bank's web server. Which attack is this?",
    type: "single",
    options: ["Deauthentication", "DDoS", "Buffer overflow", "DNS poisoning"],
    answer: 3,
    explanation: "DNS poisoning modifies DNS records to redirect users to a malicious IP address."
  },
  {
    id: "b12", domain: "Governance & Compliance",
    question: "A company performs a disaster recovery exercise during an annual meeting. What is this?",
    type: "single",
    options: ["Capacity planning", "Business impact analysis", "Continuity of operations", "Tabletop exercise"],
    answer: 3,
    explanation: "A tabletop exercise is a discussion-based exercise where participants walk through a simulated scenario."
  },
  {
    id: "b13", domain: "Threats & Vulnerabilities",
    question: "Security logs show 445+ failed password attempts for root from the same IP. What describes this?",
    type: "single",
    options: ["Spraying", "Downgrade", "Brute force", "DDoS"],
    answer: 2,
    explanation: "Brute force attacks systematically try many passwords against a single account."
  },
  {
    id: "b14", domain: "Application Security",
    question: "An attacker has sent more information than expected in an API call, allowing arbitrary code execution. What attack?",
    type: "single",
    options: ["Buffer overflow", "Replay attack", "Cross-site scripting", "DDoS"],
    answer: 0,
    explanation: "Buffer overflow occurs when input exceeds allocated memory, potentially allowing code execution."
  },
  {
    id: "b15", domain: "Cloud Security",
    question: "Which of the following are commonly associated with a hybrid cloud model? (Select TWO)",
    type: "multiple",
    options: ["Network protection mismatches", "Simplified compliance", "Data sovereignty concerns", "Reduced total cost"],
    answer: [0, 2],
    explanation: "Hybrid clouds face network security mismatches between on-prem and cloud, and data sovereignty concerns across jurisdictions."
  },
];

/* ========== SET C ========== */
const setC: MCQItem[] = [
  {
    id: "c1", domain: "Cryptography",
    question: "Valerie wants to use a certificate to handle multiple subdomains. What type of certificate?",
    type: "single",
    options: ["A self-signed certificate", "A root of trust certificate", "A CRL certificate", "A wildcard certificate"],
    answer: 3,
    explanation: "A wildcard certificate (e.g., *.example.com) covers all subdomains of a domain."
  },
  {
    id: "c2", domain: "General Security Concepts",
    question: "Using git is most frequently associated with what critical change management process?",
    type: "single",
    options: ["Having a backout plan", "Stakeholder analysis", "Version control", "Standard operating procedures"],
    answer: 2,
    explanation: "Git is the most widely used version control system."
  },
  {
    id: "c3", domain: "Cryptography",
    question: "Jacob wants to make it harder to crack a weak password by making it harder to test possible keys. What technique?",
    type: "single",
    options: ["Master keying", "Key stretching", "Key rotation", "Passphrase armoring"],
    answer: 1,
    explanation: "Key stretching makes brute-force slower by applying computationally intensive functions (PBKDF2, bcrypt)."
  },
  {
    id: "c4", domain: "General Security Concepts",
    question: "Log monitoring is an example of what control category?",
    type: "single",
    options: ["Technical", "Managerial", "Operational", "Physical"],
    answer: 0,
    explanation: "Log monitoring is implemented using automated systems, making it a technical control."
  },
  {
    id: "c5", domain: "General Security Concepts",
    question: "Sally wants a procedure for what to do if a change fails. What should she create?",
    type: "single",
    options: ["An impact analysis", "A backout plan", "A regression test", "A maintenance window"],
    answer: 1,
    explanation: "A backout plan documents steps to reverse a change if it fails."
  },
  {
    id: "c6", domain: "Security Architecture",
    question: "Alaina is concerned about vehicles impacting her backup generator near a parking lot. What should she install?",
    type: "single",
    options: ["A speed bump", "An access control vestibule", "Bollards", "A chain-link fence"],
    answer: 2,
    explanation: "Bollards are sturdy vertical posts designed to prevent vehicle access."
  },
  {
    id: "c7", domain: "General Security Concepts",
    question: "Ben deployed a DLP tool that flags data before emails are sent externally. What control type?",
    type: "single",
    options: ["Managerial", "Detective", "Corrective", "Preventive"],
    answer: 3,
    explanation: "A DLP tool that blocks or flags emails before they are sent is a preventive control."
  },
  {
    id: "c8", domain: "General Security Concepts",
    question: "Charles wants to reduce the threat scope of compromised credentials. Which control is best?",
    type: "single",
    options: ["Single sign-on", "Federation", "Zero trust", "Multifactor authentication"],
    answer: 2,
    explanation: "Zero trust reduces scope by requiring continuous verification regardless of network location."
  },
  {
    id: "c9", domain: "Cryptography",
    question: "Carol wants to obfuscate database data while still referring to data elements. What technique?",
    type: "single",
    options: ["Tokenization", "Encryption", "Data masking", "Data randomization"],
    answer: 0,
    explanation: "Tokenization replaces sensitive data with non-sensitive tokens maintaining referential integrity."
  },
  {
    id: "c10", domain: "Network Security",
    question: "A network admin wants users to authenticate with corporate credentials for Wi-Fi. What should be configured?",
    type: "single",
    options: ["WPA3", "802.1X", "PSK", "MFA"],
    answer: 1,
    explanation: "802.1X provides port-based network access control using corporate credentials via RADIUS."
  },
  {
    id: "c11", domain: "Incident Response",
    question: "A security admin has imaged an infected OS to a known-good version. Which IR step is this?",
    type: "single",
    options: ["Lessons learned", "Recovery", "Detection", "Containment"],
    answer: 1,
    explanation: "Re-imaging a system to restore it to a known-good state is part of the Recovery phase."
  },
  {
    id: "c12", domain: "VPN & Remote Access",
    question: "A company's VPN performs a posture assessment during login. What mitigation technique is this?",
    type: "single",
    options: ["Encryption", "Decommissioning", "Least privilege", "Configuration enforcement"],
    answer: 3,
    explanation: "Posture assessment during VPN login is a form of configuration enforcement."
  },
  {
    id: "c13", domain: "Application Security",
    question: "A user typed USER77' OR '1'='1 in a search field and all records were displayed. What attack?",
    type: "single",
    options: ["Cross-site scripting", "Buffer overflow", "SQL injection", "SSL stripping"],
    answer: 2,
    explanation: "The ' OR '1'='1 syntax is a classic SQL injection attack that bypasses authentication."
  },
  {
    id: "c14", domain: "Mobile Device Management",
    question: "A company is deploying a new app to field employees with various devices. Which deployment model?",
    type: "single",
    options: ["CYOD", "SSO", "COPE", "BYOD"],
    answer: 2,
    explanation: "COPE (Corporate-Owned, Personally Enabled) lets the company manage the device while allowing personal use."
  },
  {
    id: "c15", domain: "Security Operations",
    question: "A Linux admin downloads an ISO and the site shows a SHA256 hash. What does it verify?",
    type: "single",
    options: ["File was not corrupted during transfer", "Provides a decryption key", "Authenticates the site", "Confirms no malware"],
    answer: 0,
    explanation: "Comparing the SHA256 hash verifies the file's integrity — that it wasn't corrupted or tampered with during download."
  },
];

export const mcqSets: MCQSet[] = [
  { id: 'A', label: 'Set A', questions: setA },
  { id: 'B', label: 'Set B', questions: setB },
  { id: 'C', label: 'Set C', questions: setC },
];

export const mcqQuestions = setA;

// Get all unique domains across all sets
export function getAllMCQDomains(): string[] {
  const domains = new Set<string>();
  mcqSets.forEach(set => set.questions.forEach(q => domains.add(q.domain)));
  return Array.from(domains).sort();
}
