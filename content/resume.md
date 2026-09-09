---
name: Samuel Habib
title: Software Engineer
location: New York, NY
links:
  - label: Email
    href: mailto:samuel.habib31@gmail.com
  - label: LinkedIn
    href: https://www.linkedin.com/in/samuel-habib-50605a19a/
  - label: GitHub
    href: https://github.com/samuelhabib
  - label: Resume (PDF)
    href: /Resume.pdf
summary: >
  I build data systems for healthcare that have to stay correct without anyone
  watching them.
experience:
  - company: ExaCare
    role: Full Stack Software Engineer
    location: Manhattan, NY
    start: Feb 2026
    end: Present
    bullets:
      - Owned the Referral Outbound Center end to end and launched it in about a month, piloting 25+ facilities at a 100% retention rate.
      - Self-scoped a Provider Directory, building an ingestion pipeline over public CMS and NPI data, processing 40,000+ rows across six rosters.
      - Built self-healing reconciliation via weekly cron re-ingestion, keeping directory data current and eliminating duplicate facility records.
      - Cut a core API endpoint's latency by 42% and its payload by 70%, and eliminated full-table scans behind alarms firing about 144 times a day.
      - Built an internal on-call report tool adopted team-wide, cutting weekly report prep time by 50% through faster data gathering.
      - Became a technical reference for other engineering teams, shaping sound technical tradeoffs through hands-on design review.
      - Introduced AI-assisted engineering workflows, Claude Code and the Superpowers workflow, and presented them company-wide.
  - company: Apple
    role: Software Development Engineer
    location: Austin, TX
    start: Sept 2023
    end: Feb 2026
    bullets:
      - Contributed to Apple Travel, enhancing approval workflows for purchases, travel, and access across Apple employees and vendors.
      - Led development of an AI-based receipt-parsing service for Apple Travel wallet, combining LLM extraction, rule-based validation, and schema normalization to reliably process third-party receipts and provide end-to-end expense automation.
      - Led receipt integrations in Apple Travel, exposing APIs to third-party partners, setting up and maintaining SSL/TLS certificates, coordinating testing, and automating expense reconciliation and bookings, reducing manual processing by 80%.
      - Designed scalable RESTful APIs with Java, Spring Boot, and WebFlux, enabling high-throughput, low-latency processing.
      - Owned and developed BART, a structured budget reconciliation system that replaced spreadsheets, improving financial tracking and reducing errors by 95%, and authored technical documentation to speed team onboarding and maintainability.
      - Architected OIDC authentication with RBAC for secure role-based access and seamless system integration.
      - Optimized complex Oracle SQL queries, reducing data retrieval time by 33% for budget tracking and expense forecasting.
      - Implemented Solr-based indexed search, reducing approval lookup times by 90% and improving auditability and compliance.
      - Achieved 85%+ unit test coverage with JUnit and Mockito, improving reliability and reducing defects by 20%.
  - company: Amazon
    role: Software Development Engineer Intern
    location: Toronto, ON
    start: June 2024
    end: Sept 2024
    bullets:
      - Developed an internal visualization tool for FBA sellers, enabling efficient analysis of business metrics and insights.
      - Used CDK to deploy an S3, SQS, and Lambda flow for storage, querying, and retrieval across distributed environments.
      - Created a data system to asynchronously pull and convert S3 metrics into Java data models for real-time investigation.
      - Built a scalable pipeline on S3 notifications, SQS, and Lambda, processing 70,000+ requests an hour across regions.
      - Modified React.js components for multi-tabbed data visualization, with exception handling and fluid interaction.
      - Improved JSON parsing with Java and Lombok, designing flexible models and interfaces for maintainability.
      - Achieved 83% test coverage with 55 JUnit tests.
  - company: Amazon
    role: Software Development Engineer Intern
    location: Toronto, ON
    start: May 2023
    end: Sept 2023
    bullets:
      - Designed and built an end-to-end system leveraging AWS SQS, DynamoDB, DAX, SNS, and VPC.
      - Developed a partitioning mechanism in Kotlin to distinguish between data types, improving data accuracy by 90%.
      - Implemented DAX caching strategies that reduced costs by 45%.
      - Managed the full project cycle, integrating it into the team's system with zero added latency.
      - Established CloudWatch alarms and custom real-time dashboards tracking p90, max, min, and average metrics.
      - Designed CDK infrastructure to be easily configurable for future datasets.
      - Introduced the capability to handle 2B+ records an hour in the largest dataset using AWS services.
  - company: AMD
    role: Software Engineer Full Stack Intern
    location: Toronto, ON
    start: May 2022
    end: May 2023
    bullets:
      - Built an auto-scaling, self-healing backend in Ruby and YAML running 1,000+ regression tests in parallel.
      - Boosted workflow efficiency by 70% by automating CI/CD logging pipelines in Ruby.
      - Built a gateway for parsing and filtering log files with regex, standardizing the logging dashboard.
      - Applied Agile best practices that increased software delivery speed by 50%.
      - Developed and maintained PHP front-end code relaying data to a MySQL backend over REST APIs.
      - Used JIRA and worked with other engineers to monitor and resolve backend issues.
skills:
  - group: Languages
    items: [Python, Java, Kotlin, TypeScript, JavaScript, Ruby, C++, C#, SQL]
  - group: Backend and data
    items: [Spring Boot, WebFlux, Flask, Node.js, PostgreSQL, Oracle SQL, DynamoDB]
  - group: Infrastructure
    items: [AWS, GCP, Docker, Jenkins, CI/CD, Git]
  - group: Search and AI
    items: [Solr, LLM integration, NLP, RoBERTa]
  - group: AI-assisted development
    items: [Claude Code, OpenAI Codex, Cursor, Devin, spec-driven agent workflows, MCP]
education:
  - school: Toronto Metropolitan University
    degree: B.Eng, Computer Engineering
    detail: CGPA 3.90
    start: 2019
    end: 2024
---

## Samuel Habib — Software Engineer

I build data systems for healthcare that have to stay correct without anyone
watching them. New York, NY.

### ExaCare — Full Stack Software Engineer (Feb 2026 – Present)

- Owned the Referral Outbound Center end to end and launched it in about a month, piloting 25+ facilities at a 100% retention rate.
- Self-scoped a Provider Directory, building an ingestion pipeline over public CMS and NPI data, processing 40,000+ rows across six rosters.
- Built self-healing reconciliation via weekly cron re-ingestion, keeping directory data current and eliminating duplicate facility records.
- Cut a core API endpoint's latency by 42% and its payload by 70%, and eliminated full-table scans behind alarms firing ~144x a day.
- Built an internal on-call report tool adopted team-wide, cutting weekly report prep time by 50% through faster data gathering.
- Became a technical reference for other engineering teams, shaping sound technical tradeoffs through hands-on design review.
- Introduced AI-assisted engineering workflows — Claude Code and the Superpowers workflow — and presented them company-wide.

### Apple — Software Development Engineer (Sept 2023 – Feb 2026)

- Contributed to Apple Travel, enhancing approval workflows for purchases, travel, and access across Apple employees and vendors.
- Led development of an AI-based receipt-parsing service for Apple Travel wallet: LLM extraction plus rule-based validation and schema normalization, for reliable third-party receipt processing and end-to-end expense automation.
- Led receipt integrations in Apple Travel: exposed APIs to third-party partners, set up and maintained SSL/TLS certificates, coordinated testing, and automated expense reconciliation and bookings, reducing manual processing by 80%.
- Designed scalable RESTful APIs with Java, Spring Boot, and WebFlux for high-throughput, low-latency processing.
- Owned and developed BART, a structured budget reconciliation system that replaced spreadsheets: ~95% fewer errors, better financial tracking, with technical documentation to speed team onboarding.
- Architected OIDC authentication with RBAC for secure role-based access.
- Optimized complex Oracle SQL queries, cutting data retrieval time 33% for budget tracking and expense forecasting.
- Implemented Solr-based indexed search, cutting approval lookup times 90% and improving auditability and compliance.
- Achieved 85%+ unit test coverage with JUnit and Mockito; defects down ~20%.

### Amazon — SDE Intern (June 2024 – Sept 2024, Toronto)

- Internal visualization tool for FBA sellers, for efficient analysis of business metrics and insights.
- CDK-deployed S3 / SQS / Lambda flow for storage, querying, and retrieval across distributed environments.
- Data system to asynchronously pull and convert S3 metrics into Java data models for real-time investigation.
- Scalable pipeline on S3 notifications, SQS, and Lambda processing 70,000+ requests an hour across regions.
- React.js components for multi-tabbed data visualization, with exception handling and fluid interaction.
- Improved JSON parsing with Java and Lombok; flexible models and interfaces for maintainability.
- 83% test coverage with 55 JUnit tests.

### Amazon — SDE Intern (May 2023 – Sept 2023, Toronto)

- End-to-end system leveraging AWS SQS, DynamoDB, DAX, SNS, and VPC.
- Partitioning mechanism in Kotlin to distinguish between data types, improving data accuracy 90%.
- DAX caching strategies that reduced costs 45%.
- Managed the full project cycle, integrating it into the team's system with zero added latency.
- CloudWatch alarms and custom real-time dashboards tracking p90, max, min, and average metrics.
- CDK infrastructure built to be easily configurable for future datasets.
- Introduced the capability to handle 2B+ records an hour in the largest dataset using AWS services.

### AMD — Full Stack SW Engineer Intern (May 2022 – May 2023, Toronto)

- Auto-scaling, self-healing Ruby/YAML backend running 1,000+ regression tests in parallel.
- Automated the CI/CD logging pipelines in Ruby, boosting workflow efficiency 70%.
- Gateway for parsing and filtering log files with regex, standardizing the logging dashboard.
- Agile best practices that increased software delivery speed 50%.
- PHP front-end code relaying data to a MySQL backend over REST APIs.
- Used JIRA and worked with other engineers to monitor and resolve backend issues.

### Education

Toronto Metropolitan University — B.Eng, Computer Engineering, CGPA 3.90 (2019 – 2024).
