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

/* ========== SET A (original) ========== */
const setA: MCQItem[] = [
  {
    id: "iam1",
    domain: "Identity and Access Management",
    question: "Which MFA method provides the strongest resistance to phishing?",
    type: "single",
    options: ["SMS OTP", "Email OTP", "Hardware FIDO2 security key", "Push notification"],
    answer: 2,
    explanation: "FIDO2/WebAuthn hardware security keys use cryptographic challenge-response bound to the origin, making them immune to phishing attacks unlike SMS, email, or push-based methods."
  },
  {
    id: "iam2",
    domain: "Identity and Access Management",
    question: "Which access control model uses labels such as 'Top Secret' and 'Confidential' to restrict access?",
    type: "single",
    options: ["Role-Based Access Control (RBAC)", "Mandatory Access Control (MAC)", "Discretionary Access Control (DAC)", "Attribute-Based Access Control (ABAC)"],
    answer: 1,
    explanation: "MAC uses classification labels assigned by administrators. Users cannot change permissions; access is determined by comparing the user's clearance with the resource's classification."
  },
  {
    id: "fw1",
    domain: "Firewall & ACL Configuration",
    question: "Select all ports that should be allowed inbound to a web server in a DMZ.",
    type: "multiple",
    options: ["22 (SSH)", "80 (HTTP)", "443 (HTTPS)", "3306 (MySQL)"],
    answer: [1, 2],
    explanation: "Only HTTP (80) and HTTPS (443) should be exposed inbound to a DMZ web server. SSH should be restricted to management networks, and MySQL should never be directly exposed."
  },
  {
    id: "crypto1",
    domain: "Cryptography",
    question: "Which algorithm is an asymmetric encryption algorithm?",
    type: "single",
    options: ["AES-256", "RSA", "SHA-256", "3DES"],
    answer: 1,
    explanation: "RSA is an asymmetric (public-key) algorithm. AES and 3DES are symmetric block ciphers, and SHA-256 is a hashing algorithm, not encryption."
  },
  {
    id: "crypto2",
    domain: "Cryptography",
    question: "Which of the following are hashing algorithms? (Select all that apply)",
    type: "multiple",
    options: ["MD5", "AES", "SHA-256", "RSA"],
    answer: [0, 2],
    explanation: "MD5 and SHA-256 are hashing algorithms that produce fixed-length digests. AES is symmetric encryption and RSA is asymmetric encryption."
  },
  {
    id: "net1",
    domain: "Network Security",
    question: "What is the primary purpose of a VLAN?",
    type: "single",
    options: ["Encrypt network traffic", "Segment broadcast domains", "Provide wireless access", "Monitor network traffic"],
    answer: 1,
    explanation: "VLANs logically segment a physical network into separate broadcast domains, limiting broadcast traffic and improving security by isolating groups of devices."
  },
  {
    id: "net2",
    domain: "Network Security",
    question: "Which protocol is used to securely access a remote command line?",
    type: "single",
    options: ["Telnet", "FTP", "SSH", "SNMP"],
    answer: 2,
    explanation: "SSH (Secure Shell) encrypts the session, providing confidentiality and integrity for remote CLI access. Telnet transmits in cleartext and should never be used."
  },
  {
    id: "threat1",
    domain: "Threats & Vulnerabilities",
    question: "What type of attack involves an attacker inserting themselves between two communicating parties?",
    type: "single",
    options: ["Phishing", "On-path (Man-in-the-Middle)", "SQL Injection", "Cross-Site Scripting"],
    answer: 1,
    explanation: "An on-path (MitM) attack positions the attacker between two parties to intercept, modify, or eavesdrop on communications without either party's knowledge."
  },
  {
    id: "threat2",
    domain: "Threats & Vulnerabilities",
    question: "Which of the following are social engineering techniques? (Select all that apply)",
    type: "multiple",
    options: ["Pretexting", "Buffer overflow", "Tailgating", "SQL injection"],
    answer: [0, 2],
    explanation: "Pretexting (creating a fabricated scenario) and tailgating (following someone through a secure door) are social engineering. Buffer overflow and SQL injection are technical attacks."
  },
  {
    id: "ops1",
    domain: "Security Operations",
    question: "What is the first step in the incident response process?",
    type: "single",
    options: ["Containment", "Eradication", "Preparation", "Identification"],
    answer: 2,
    explanation: "Preparation is the first phase of incident response (NIST SP 800-61). It involves establishing policies, procedures, teams, and tools before an incident occurs."
  },
  {
    id: "ops2",
    domain: "Security Operations",
    question: "Which log source would be MOST useful for detecting unauthorized login attempts?",
    type: "single",
    options: ["Firewall logs", "Authentication server logs", "DNS logs", "DHCP logs"],
    answer: 1,
    explanation: "Authentication server logs record all login attempts (successful and failed), making them the best source for detecting brute force or unauthorized access attempts."
  },
  {
    id: "arch1",
    domain: "Security Architecture",
    question: "Which security concept ensures that a user has only the minimum permissions needed to perform their job?",
    type: "single",
    options: ["Separation of duties", "Least privilege", "Defense in depth", "Zero trust"],
    answer: 1,
    explanation: "The principle of least privilege limits user access rights to the bare minimum needed for their role, reducing the attack surface if an account is compromised."
  },
  {
    id: "arch2",
    domain: "Security Architecture",
    question: "Select all components of a Zero Trust architecture. (Select all that apply)",
    type: "multiple",
    options: ["Micro-segmentation", "Implicit trust for internal users", "Continuous verification", "Perimeter-only security"],
    answer: [0, 2],
    explanation: "Zero Trust relies on micro-segmentation and continuous verification. It explicitly rejects implicit trust and perimeter-only security models."
  },
  {
    id: "comp1",
    domain: "Governance & Compliance",
    question: "Which regulation specifically protects the privacy of health information in the United States?",
    type: "single",
    options: ["GDPR", "PCI-DSS", "HIPAA", "SOX"],
    answer: 2,
    explanation: "HIPAA (Health Insurance Portability and Accountability Act) establishes standards for protecting sensitive patient health information in the US."
  },
  {
    id: "comp2",
    domain: "Governance & Compliance",
    question: "What is the purpose of a Business Impact Analysis (BIA)?",
    type: "single",
    options: ["Identify network vulnerabilities", "Assess the impact of disruptions on business functions", "Test incident response procedures", "Audit user access controls"],
    answer: 1,
    explanation: "A BIA identifies critical business functions and assesses the potential impact of disruptions, helping prioritize recovery efforts and determine RTO/RPO values."
  }
];

/* ========== SET B (from Messer Exam A) ========== */
const setB: MCQItem[] = [
  {
    id: "b-a6",
    domain: "Security Operations",
    question: "A company hired a third-party to gather information about their servers without direct internal network access. Which describes this approach?",
    type: "single",
    options: ["Vulnerability scanning", "Passive reconnaissance", "Supply chain analysis", "Regulatory audit"],
    answer: 1,
    explanation: "Passive reconnaissance gathers information from publicly available sources without directly interacting with the target's internal systems."
  },
  {
    id: "b-a7",
    domain: "Network Security",
    question: "A company's email server received email from a server not on the authorized list. Which determines the disposition of this message?",
    type: "single",
    options: ["SPF", "NAC", "DMARC", "DKIM"],
    answer: 2,
    explanation: "DMARC (Domain-based Message Authentication, Reporting & Conformance) determines the disposition of messages that fail SPF and/or DKIM checks."
  },
  {
    id: "b-a8",
    domain: "Threats & Vulnerabilities",
    question: "Which threat actor would be MOST likely to attack systems for direct financial gain?",
    type: "single",
    options: ["Organized crime", "Hacktivist", "Nation state", "Shadow IT"],
    answer: 0,
    explanation: "Organized crime groups are primarily motivated by financial gain through ransomware, fraud, and data theft. Hacktivists seek political change; nation states seek intelligence."
  },
  {
    id: "b-a10",
    domain: "Security Architecture",
    question: "A city is building an ambulance dispatch network. Which should have the highest priority?",
    type: "single",
    options: ["Integration costs", "Patch availability", "System availability", "Power usage"],
    answer: 2,
    explanation: "For emergency services like ambulance dispatch, system availability is the highest priority. Downtime could directly impact life safety."
  },
  {
    id: "b-a18",
    domain: "Security Operations",
    question: "An administrator needs to know how often firewall hardware is expected to fail between repairs. Which metric describes this?",
    type: "single",
    options: ["MTBF", "RTO", "MTTR", "RPO"],
    answer: 0,
    explanation: "MTBF (Mean Time Between Failures) measures the expected time between hardware failures. RTO is recovery time, MTTR is repair time, RPO is data loss tolerance."
  },
  {
    id: "b-a19",
    domain: "Threats & Vulnerabilities",
    question: "An attacker calls a help desk pretending to be a director, requesting a password reset. What type of attack is this?",
    type: "single",
    options: ["Social engineering", "Supply chain", "Watering hole", "On-path"],
    answer: 0,
    explanation: "Social engineering manipulates people into performing actions or divulging information. Impersonating authority figures is a classic social engineering tactic."
  },
  {
    id: "b-a20",
    domain: "Governance & Compliance",
    question: "Two companies want to qualify their partnership with a broad formal agreement. Which describes this?",
    type: "single",
    options: ["SLA", "SOW", "MOA", "NDA"],
    answer: 2,
    explanation: "A Memorandum of Agreement (MOA) is a broad formal agreement between organizations outlining mutual commitments. SLAs define service levels, SOWs define specific work, NDAs protect confidential information."
  },
  {
    id: "b-a23",
    domain: "Identity and Access Management",
    question: "A password policy lacks restrictions on attempts and doesn't require periodic changes. Which TWO would fix this?",
    type: "multiple",
    options: ["Password complexity", "Password expiration", "Password reuse", "Account lockout", "Password managers"],
    answer: [1, 3],
    explanation: "Password expiration requires periodic changes, and account lockout limits failed login attempts. These directly address the two identified policy gaps."
  },
  {
    id: "b-a27",
    domain: "Security Architecture",
    question: "A company wants to examine credentials of each person entering the data center building. What facilitates this?",
    type: "single",
    options: ["Access control vestibule", "Video surveillance", "Pressure sensors", "Bollards"],
    answer: 0,
    explanation: "An access control vestibule (mantrap) forces individuals to authenticate before proceeding, allowing security to examine credentials one person at a time."
  },
  {
    id: "b-a30",
    domain: "Security Operations",
    question: "A company needs mobile devices auto-locked after timeout, GPS tracking, and user/company data separation. What implements this?",
    type: "single",
    options: ["Segmentation", "Biometrics", "COPE", "MDM"],
    answer: 3,
    explanation: "Mobile Device Management (MDM) provides centralized control over mobile devices, including auto-lock policies, location tracking, and data containerization."
  },
  {
    id: "b-a31",
    domain: "Security Operations",
    question: "A vulnerability scan shows no issues for Windows servers, but a significant unpatched vulnerability was announced last week. What describes this?",
    type: "single",
    options: ["Exploit", "Compensating controls", "Zero-day attack", "False negative"],
    answer: 3,
    explanation: "A false negative occurs when a scanner fails to detect a known vulnerability. The scanner's signatures likely haven't been updated to detect the new vulnerability."
  },
  {
    id: "b-a39",
    domain: "Network Security",
    question: "Users are being directed to a different IP address than the bank's web server. Which attack is this MOST likely?",
    type: "single",
    options: ["Deauthentication", "DDoS", "Buffer overflow", "DNS poisoning"],
    answer: 3,
    explanation: "DNS poisoning (cache poisoning) modifies DNS records to redirect users to a malicious IP address. This causes users to visit a fake site instead of the legitimate one."
  },
  {
    id: "b-a48",
    domain: "Governance & Compliance",
    question: "A company performs a disaster recovery exercise during an annual meeting, simulating and discussing a disaster scenario. What is this?",
    type: "single",
    options: ["Capacity planning", "Business impact analysis", "Continuity of operations", "Tabletop exercise"],
    answer: 3,
    explanation: "A tabletop exercise is a discussion-based exercise where participants walk through a simulated disaster scenario without deploying resources or activating systems."
  },
  {
    id: "b-a52",
    domain: "Threats & Vulnerabilities",
    question: "Security logs show 445+ failed password attempts for root from the same IP. What describes this attack?",
    type: "single",
    options: ["Spraying", "Downgrade", "Brute force", "DDoS"],
    answer: 2,
    explanation: "Brute force attacks systematically try many passwords against a single account. The repeated attempts from one IP targeting the root account are classic brute force behavior."
  },
  {
    id: "b-a64",
    domain: "Security Architecture",
    question: "An organization requires all application requests to be validated at a policy enforcement point. What security model is this?",
    type: "single",
    options: ["Public key infrastructure", "Zero trust", "Discretionary access control", "Federation"],
    answer: 1,
    explanation: "Zero trust architecture requires every access request to be validated at a policy enforcement point, regardless of where the request originates."
  },
];

/* ========== SET C (from Seidl + additional) ========== */
const setC: MCQItem[] = [
  {
    id: "c-s1",
    domain: "Cryptography",
    question: "Valerie wants to use a certificate to handle multiple subdomains. What type of certificate should she use?",
    type: "single",
    options: ["A self-signed certificate", "A root of trust certificate", "A CRL certificate", "A wildcard certificate"],
    answer: 3,
    explanation: "A wildcard certificate (e.g., *.example.com) covers all subdomains of a domain, allowing one certificate for sales.example.com, support.example.com, etc."
  },
  {
    id: "c-s2",
    domain: "General Security Concepts",
    question: "Using a tool like git is most frequently associated with what critical change management process?",
    type: "single",
    options: ["Having a backout plan", "Stakeholder analysis", "Version control", "Standard operating procedures"],
    answer: 2,
    explanation: "Git is the most widely used version control system, allowing teams to track changes, revert to previous versions, and manage collaborative development."
  },
  {
    id: "c-s3",
    domain: "Cryptography",
    question: "Jacob wants to make it harder to crack a weak password by making it harder to test possible keys during brute-force. What technique is this?",
    type: "single",
    options: ["Master keying", "Key stretching", "Key rotation", "Passphrase armoring"],
    answer: 1,
    explanation: "Key stretching makes brute-force attacks slower by applying a computationally intensive function (like PBKDF2 or bcrypt) to the password, increasing the time needed per guess."
  },
  {
    id: "c-s4",
    domain: "General Security Concepts",
    question: "Log monitoring is an example of what control category?",
    type: "single",
    options: ["Technical", "Managerial", "Operational", "Physical"],
    answer: 0,
    explanation: "Log monitoring is implemented using automated systems and technology, making it a technical control. Technical controls are implemented through technology rather than people or policies."
  },
  {
    id: "c-s5",
    domain: "Cryptography",
    question: "Diffie-Hellman and RSA are both examples of what encryption-related solution?",
    type: "single",
    options: ["Rekeying", "Certificate revocation protocols", "Key exchange algorithms", "Key generation algorithms"],
    answer: 2,
    explanation: "Both Diffie-Hellman and RSA can be used for key exchange, allowing parties to securely establish shared secrets over insecure channels. RSA is also used for encryption and digital signatures."
  },
  {
    id: "c-s6",
    domain: "General Security Concepts",
    question: "Sally wants to ensure her change management includes a procedure for what to do if the change fails. What should she create?",
    type: "single",
    options: ["An impact analysis", "A backout plan", "A regression test", "A maintenance window"],
    answer: 1,
    explanation: "A backout plan documents the steps to reverse a change if it fails, allowing the system to be restored to its previous working state."
  },
  {
    id: "c-s7",
    domain: "Security Architecture",
    question: "Alaina is concerned about vehicles impacting her backup generator near a parking lot. What should she install?",
    type: "single",
    options: ["A speed bump", "An access control vestibule", "Bollards", "A chain-link fence"],
    answer: 2,
    explanation: "Bollards are sturdy vertical posts designed to prevent vehicle access while allowing pedestrian traffic. They are the best choice for protecting fixed equipment near parking areas."
  },
  {
    id: "c-s8",
    domain: "General Security Concepts",
    question: "Ben deployed a DLP tool that flags specific data types before emails are sent externally. What control type is this?",
    type: "single",
    options: ["Managerial", "Detective", "Corrective", "Preventive"],
    answer: 3,
    explanation: "A DLP tool that blocks or flags emails before they are sent is a preventive control—it stops the data from leaving the organization before the action completes."
  },
  {
    id: "c-s9",
    domain: "General Security Concepts",
    question: "Charles wants to reduce the threat scope of compromised credentials. Which control is best suited?",
    type: "single",
    options: ["Single sign-on", "Federation", "Zero trust", "Multifactor authentication (MFA)"],
    answer: 2,
    explanation: "Zero trust reduces the scope of compromised credentials by requiring continuous verification and not granting implicit trust based on network location or prior authentication."
  },
  {
    id: "c-s10",
    domain: "Cryptography",
    question: "Carol wants to obfuscate database data while still being able to refer to data elements. What should she select?",
    type: "single",
    options: ["Tokenization", "Encryption", "Data masking", "Data randomization"],
    answer: 0,
    explanation: "Tokenization replaces sensitive data with non-sensitive tokens that maintain referential integrity. The original data is stored separately in a secure token vault."
  },
  {
    id: "c-s11",
    domain: "Cryptography",
    question: "What key is used to decrypt information in public key encryption?",
    type: "single",
    options: ["The recipient's private key", "The recipient's public key", "The sender's private key", "The sender's public key"],
    answer: 0,
    explanation: "In public key encryption, the sender encrypts with the recipient's public key. Only the recipient's private key can decrypt the message, ensuring confidentiality."
  },
  {
    id: "c-s12",
    domain: "General Security Concepts",
    question: "What type of control is a policy or procedure?",
    type: "single",
    options: ["Directive", "Corrective", "Detective", "Preventive"],
    answer: 0,
    explanation: "Policies and procedures are directive controls—they tell people what to do and how to do it, establishing expected behavior and compliance requirements."
  },
  {
    id: "c-s13",
    domain: "General Security Concepts",
    question: "Jason's Apple system uses a separate portion of its SoC to store keys and biometric information. What is this component called?",
    type: "single",
    options: ["A TPM", "A HSM", "A secure enclave", "A screened subnet"],
    answer: 2,
    explanation: "Apple's Secure Enclave is a dedicated security subsystem within the SoC that handles cryptographic keys and biometric data, isolated from the main processor."
  },
  {
    id: "c-s14",
    domain: "General Security Concepts",
    question: "Jack deployed a system that appears vulnerable to attackers, designed to capture attack data for analysis. What is this tool?",
    type: "single",
    options: ["A tarpit", "A honeypot", "A beehive", "An intrusion detection system"],
    answer: 1,
    explanation: "A honeypot is a decoy system designed to look like a legitimate target. It attracts attackers and captures their techniques and tools for security analysis."
  },
  {
    id: "c-s15",
    domain: "Security Operations",
    question: "A security administrator examines a recently compromised server and finds it was exploited due to a known OS vulnerability. What describes this finding?",
    type: "single",
    options: ["Root cause analysis", "E-discovery", "Risk appetite", "Data subject"],
    answer: 0,
    explanation: "Root cause analysis identifies the fundamental reason for a security incident. Finding that a known vulnerability caused the compromise is a root cause analysis finding."
  },
];

export const mcqSets: MCQSet[] = [
  { id: 'A', label: 'Set A', questions: setA },
  { id: 'B', label: 'Set B', questions: setB },
  { id: 'C', label: 'Set C', questions: setC },
];

export const mcqQuestions = setA;
