import React from 'react'
import PropTypes from 'prop-types'
import styles from './Profile.scss'

const ProfileTermsText = props => (
  <div>
    {/* <p>
      <b>
        simuwatt, Inc. <br />
        http://www.simuwatt.com/ <br />
        Website Terms of Use <br />
        Last Updated February 26th, 2021
      </b>
    </p> */}
    <h4 style={{ textAlign: 'center' }}>TERMS OF USE</h4>
    <p>
      THESE TERMS OF USE (THIS “AGREEMENT”) GOVERN YOUR USE OF OUR SERVICES. BY
      USING OUR SERVICES, YOU ACCEPT THIS AGREEMENT AND AGREE TO ITS TERMS. IF
      YOU ARE USING OUR SERVICES ON BEHALF OF A COMPANY OR OTHER LEGAL ENTITY,
      YOU ARE ACCEPTING THIS AGREEMENT FOR YOURSELF AND SUCH ENTITY AND ITS
      AFFILIATES AND YOU REPRESENT THAT YOU HAVE THE AUTHORITY TO BIND SUCH
      ENTITY AND ITS AFFILIATES TO THIS AGREEMENT. IF YOU DO NOT HAVE SUCH
      AUTHORITY, OR IF YOU DO NOT AGREE WITH THESE TERMS AND CONDITIONS, YOU
      MUST NOT ACCEPT THIS AGREEMENT AND MAY NOT USE THE SERVICES.
    </p>
    <p>This Agreement was last updated on February 26th, 2021.</p>

    <h4>1. DEFINITIONS</h4>
    <p>
      “Affiliate” means, with respect to any entity, any entity which directly
      or indirectly controls, is controlled by, or is under common control with
      the subject entity. “Control,” for purposes of this definition, means
      direct or indirect ownership or control of more than 50% of the voting
      interests of the subject entity.
    </p>
    <p>
      “Malicious Code” means viruses, worms, time bombs, Trojan horses, and
      other harmful or malicious code, files, scripts, agents, or programs.
    </p>
    <p>
      “Order” means the purchase order or other written document (electronic or
      otherwise) provided or accepted by Us that addresses your rights to access
      the Services and the Fees payable with respect thereto.
    </p>
    <p>
      “Services” means the online sustainability and energy efficiency,
      intelligence, reporting and analytics applications and platform provided
      by Us via http://app.buildee.com and/or other designated websites and any
      corresponding support services provided by Us.
    </p>
    <p>
      “Term” means the term of your subscription to or authorized access of the
      Services.
    </p>
    <p>
      “Third-Party Applications” means online Web-based applications and offline
      software products that are provided by third parties and that may
      interoperate with the Services.
    </p>
    <p>
      “User” means any individual who uses the Services on Your behalf or
      through Your accounts or passwords, whether authorized or not.{' '}
    </p>
    <p>“We,” “Us” or “Our” means simuwatt, Inc. d/b/a buildee. </p>
    <p>
      “You” or “Your” means the individual accessing the Services and the
      company or other legal entity for whom or on behalf of which such person
      is accessing the Services.
    </p>
    <p>
      “Your Data” means the data or information submitted by Users to, by, or
      through, the Services.
    </p>

    <h4>2. USE OF THE SERVICES</h4>
    <p>
      2.1. <span className={styles.privacySpan}>Use of the Services</span>
      {'. '}
      During the Term, You may access and use the Services on the terms and
      conditions set forth in this Agreement.
    </p>
    <p>
      2.2. <span className={styles.privacySpan}>Usage Limitations</span>
      {'. '} The Services may be subject to other limitations as We may specify
      from time to time.
    </p>
    <p>
      2.3. <span className={styles.privacySpan}>Your Responsibilities</span>
      {'. '} You shall (i) be responsible for Users’ compliance with this
      Agreement, (ii) be solely responsible for the accuracy, quality,
      integrity, and legality of Your Data and of the means by which You
      acquired Your Data, (iii) use commercially reasonable efforts to prevent
      unauthorized access to or use of the Services and notify Us promptly of
      any such unauthorized access or use, and (iv) use the Services only in
      accordance with this Agreement and all applicable laws and government
      regulations.
    </p>
    <p>
      You shall not (a) make the Services available to anyone other than Users,
      (b) sell, resell, rent, or lease the Services, (c) use the Services to
      store or transmit infringing, libelous, or otherwise unlawful or tortious
      material, or to store or transmit material in violation of third-party
      privacy rights, (d) use the Services to store or transmit Malicious Code,
      (e) interfere with or disrupt the integrity or performance of the
      Services, Third-Party Applications, or third-party data contained therein,
      or (f) attempt to gain unauthorized access to the Services, Third-Party
      Applications, or their related systems or networks.
    </p>

    <p>
      2.4. <span className={styles.privacySpan}>Modification of Services</span>
      {'. '}
      Except as otherwise agreed in writing, We reserve the right, at any time,
      to modify, suspend, or discontinue the Services (in whole or in part) with
      or without notice to You. You agree that We will not be liable to You or
      to any third party for any modification, suspension, or discontinuation of
      the Services or any part thereof.
    </p>
    <p>
      2.5. <span className={styles.privacySpan}>Payment</span>
      {'. '} Subscription pricing and other service fees for accessing the
      Services (collectively, “Fees”) shall be as stated in Your Order or at
      purchase, sign-up, or other opt-in, and, except as otherwise agreed in
      writing, may be modified from time to time in Our sole discretion. Fees
      (and any applicable taxes) paid are non-refundable and We may assess
      interest on unpaid Fees and taxes from the due date until the date paid at
      the lesser of one and one-half percent (1.5%) per month or the maximum
      amount allowed by applicable law. If payment of any Fee or tax is overdue,
      We may suspend provision of the Services, until the overdue amounts have
      been paid in full. You agree to pay all costs incurred by Us in collecting
      overdue Fees, taxes, and interest, including reasonable attorneys’ fees.
    </p>
    <p>
      2.6. <span className={styles.privacySpan}>Grant of License</span>
      {'. '} You hereby grant to Us the right and license to use Your Data and
      any and all other information submitted by you to the Site or through the
      Services. You represent and warrant that you have the right to share Your
      Data and any information provided to the Site or through the Services,
      including under any applicable laws. You hereby represent and warrant that
      Your Data and any other information you provide to the Site or through the
      Services does not infringe, misappropriate, or otherwise violate any
      copyright, trademark, or other intellectual property right, right of
      privacy, right of publicity, or any other right of any entity or person;
      and that no such information is unlawful, libelous, defamatory, obscene,
      pornographic, or profane, or could constitute or encourage conduct that
      would be considered a criminal offense.
    </p>

    <h4>3. THIRD-PARTY PROVIDERS</h4>
    <p>
      3.1.{' '}
      <span className={styles.privacySpan}>
        Acquisition of Third-Party Products and Services
      </span>
      . Any acquisition by You of third-party products or services, including
      but not limited to Third-Party Applications and implementation,
      customization and other consulting services, and any exchange of data
      between You and any third-party provider, is solely between You and the
      applicable third-party provider, even if accessed or transmitted through
      the Service. We do not warrant or support third-party products or
      services, including Third-Party Applications, whether or not they are
      designated by Us as “certified” or otherwise.
    </p>
    <p>
      3.2.{' '}
      <span className={styles.privacySpan}>
        Third-Party Applications and Your Data
      </span>
      . We are not responsible for any disclosure, modification or deletion of
      Your Data resulting from any access to such data or information by
      Third-Party Application providers.
    </p>

    <h4>4. PROPRIETARY RIGHTS</h4>
    <p>
      4.1.{' '}
      <span className={styles.privacySpan}>
        Reservation of Rights; Intellectual Property
      </span>
      . Subject to the limited rights expressly granted hereunder, we reserve
      all rights, title, and interest in and to the Services, including all
      related intellectual property rights. No rights are granted to You
      hereunder other than as expressly set forth herein. You acknowledge that
      all the intellectual property rights, including copyrights, patents,
      trademarks, and trade secrets, on, incorporated in, or related to Our
      website(s) (the “Site”) and Services are owned by Us or Our suppliers,
      partners, or Affiliates. Neither this Agreement (nor your access to the
      Services) transfers to you or any third party any rights, title, or
      interest in or to such intellectual property rights, except for the
      limited access rights expressly set forth herein. There are no implied
      licenses granted under this Agreement.
    </p>
    <p>
      4.2. <span className={styles.privacySpan}>Restrictions</span>
      {'. '} You shall not (i) permit any third party to access the Services
      except as permitted herein, (ii) create derivate works based on the Site
      or the Services, (iii) copy, frame or mirror any part or content of the
      Site or the Services, other than copying or framing on Your own internal
      networks or otherwise for Your own internal business purposes, (iv)
      reverse engineer the Services, or (v) access the Site or the Services in
      order to (a) build a competitive product or service, or (b) copy any
      features, functions or graphics of the Site or the Services.
    </p>
    <p>
      4.3. <span className={styles.privacySpan}>Suggestions</span>
      {'. '} We shall have a royalty-free, worldwide, transferable,
      sublicensable, irrevocable, perpetual license to use or incorporate into
      the Services any suggestions, enhancement requests, recommendations or
      other feedback provided by You, including any Users, relating to the
      operation of the Services, and we are under no obligation to treat such
      feedback as confidential.
    </p>

    <h4>5. CONFIDENTIALITY</h4>
    <p>
      5.1.{' '}
      <span className={styles.privacySpan}>
        Definition of Confidential Information
      </span>
      . As used herein, “Confidential Information” means all confidential
      information disclosed by a party (“Disclosing Party”) to the other party
      (“Receiving Party”), whether orally or in writing, that is designated as
      confidential or that reasonably should be understood to be confidential
      given the nature of the information and the circumstances of disclosure.
      Our Confidential Information shall include the Services; and Confidential
      Information of each party shall include the terms and conditions of this
      Agreement, as well as business and marketing plans, technology and
      technical information, product plans and designs, and business processes
      of a Disclosing Party. However, Confidential Information shall not include
      any information that (i) is or becomes generally known to the public
      without breach of any obligation owed to the Disclosing Party, (ii) was
      known to the Receiving Party prior to its disclosure by the Disclosing
      Party without breach of any obligation owed to the Disclosing Party, (iii)
      is received from a third party without breach of any obligation owed to
      the Disclosing Party, or (iv) was independently developed by the Receiving
      Party.
    </p>
    <p>
      5.2.{' '}
      <span className={styles.privacySpan}>
        Protection of Confidential Information
      </span>
      . Except as otherwise permitted in writing by the Disclosing Party, (i)
      the Receiving Party shall use the same degree of care that it uses to
      protect the confidentiality of its own confidential information of like
      kind (but in no event less than reasonable care) not to disclose or use
      any Confidential Information of the Disclosing Party for any purpose
      outside the scope of this Agreement, and (ii) the Receiving Party shall
      limit access to Confidential Information of the Disclosing Party to those
      of its employees, contractors and agents who need such access for purposes
      consistent with this Agreement and who have signed confidentiality
      agreements with the Receiving Party containing protections no less
      stringent than those herein.
    </p>
    <p>
      5.3. <span className={styles.privacySpan}>Protection of Your Data</span>
      {'. '}
      Without limiting the above, We shall use commercially reasonable efforts
      to maintain appropriate administrative, physical, and technical safeguards
      for protection of the security, confidentiality and integrity of Your
      Data.
    </p>
    <p>
      5.4. <span className={styles.privacySpan}>Compelled Disclosure</span>
      {'. '} The Receiving Party may disclose Confidential Information of the
      Disclosing Party if it is compelled by law to do so, provided the
      Receiving Party gives the Disclosing Party prior notice of such compelled
      disclosure (to the extent legally permitted) and reasonable assistance, at
      the Disclosing Party's cost, if the Disclosing Party wishes to contest the
      disclosure.
    </p>
    <p>
      5.5. <span className={styles.privacySpan}>Aggregated Data</span>
      {'. '}
      Notwithstanding the foregoing, any aggregate and/or deidentified data not
      linkable to a particular household, person, or account (“Aggregate Data”),
      regardless of how such Aggregate Data is collected or created, shall not
      be considered Confidential Information and We may use, reproduce, sell,
      publicize, or otherwise exploit such Aggregate Data in any way and without
      any compensation or remuneration to You.
    </p>

    <h4>6. WARRANTIES AND DISCLAIMERS</h4>
    <p>
      6.1 <span className={styles.privacySpan}>Disclaimer</span>
      {'. '} THE SERVICES ARE PROVIDED TO YOU ON AN “AS IS” “AS AVAILABLE” BASIS
      WITHOUT WARRANTY OF ANY KIND EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
      LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
      PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTY AS TO THE
      ACCURACY, COMPLETENESS, CURRENCY, OR RELIABILITY OF ANY CONTENT OR
      INFORMATION AVAILABLE THROUGH THE SERVICES, INCLUDING ANY INFORMATION
      REGARDING THE ENERGY USAGE, CONDITION, OR OTHER TECHNICAL ASPECTS OF ANY
      BUILDING OR THE TERMS, CONDITIONS, OR BENEFITS OF ANY PROGRAM OR OFFERING
      OF ANY THIRD PARTY. YOU ARE RESPONSIBLE FOR VERIFYING ANY INFORMATION
      BEFORE RELYING ON IT. USE OF THE SERVICES, AND ANY INFORMATION AVAILABLE
      THEREIN IS AT YOUR SOLE RISK. WE MAKE NO REPRESENTATIONS OR WARRANTIES
      THAT USE OF THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.
    </p>

    <h4>7. MUTUAL INDEMNIFICATION</h4>
    <p>
      7.1. <span className={styles.privacySpan}>Indemnification by Us</span>
      {'. '} We shall defend You against any claim, demand, suit, or proceeding
      (“Claim”) made or brought against You by any third party alleging that the
      use of the Services as permitted hereunder infringes or misappropriates
      the U.S. intellectual property rights of such third party, and shall
      indemnify You for any damages finally awarded against, and for reasonable
      attorney’s fees incurred by, You in connection with any such Claim;
      provided, that You (a) promptly give Us written notice of the Claim; (b)
      give Us sole control of the defense and settlement of the Claim (provided
      that We may not settle any Claim unless the settlement unconditionally
      releases You of all liability); and (c) provide to Us all reasonable
      assistance, at Our expense.
    </p>
    <p>
      7.2. <span className={styles.privacySpan}>Indemnification by You</span>
      {'. '}
      You shall defend Us against any Claim made or brought against Us by any
      third party arising out of Your use of the Services, and shall indemnify
      Us for any damages finally awarded against, and for reasonable attorney’s
      fees incurred by, Us in connection with any such Claim; provided, that We
      (a) promptly give You written notice of the Claim; (b) give You sole
      control of the defense and settlement of the Claim (provided that You may
      not settle any Claim unless the settlement unconditionally release Us of
      all liability and further provided that such settlement does not
      detrimentally affect our rights to and commercialization of the Services);
      and (c) provide to You all reasonable assistance, at Your expense.
    </p>
    <p>
      7.3. <span className={styles.privacySpan}>Exclusive Remedy</span>
      {'. '} This Section 7 (Mutual Indemnification) states the indemnifying
      party’s sole liability to, and the indemnified party’s exclusive remedy
      against, the other party for any type of claim for infringement or
      violation of intellectual property or other proprietary rights.
    </p>

    <h4>8. LIMITATION OF LIABILITY</h4>
    <p>
      8.1. <span className={styles.privacySpan}>Waiver of Damages</span>
      {'. '} WE SHALL NOT HAVE ANY LIABILITY WHATSOEVER, WHETHER BASED IN
      CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, FOR ANY DIRECT, INDIRECT,
      INCIDENTAL, CONSEQUENTIAL, OR SPECIAL DAMAGES ARISING OUT OF OR IN ANY WAY
      CONNECTED WITH ACCESS TO OR USE OF THE SITE OR THE SERVICES, EVEN IF WE
      HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES, INCLUDING BUT NOT
      LIMITED TO RELIANCE BY ANY PARTY ON ANY CONTENT OR INFORMATION OBTAINED
      FROM OR THROUGH THE SITE OR USE OF THE SERVICES, OR THAT ARISES IN
      CONNECTION WITH MISTAKES OR OMISSIONS IN, OR DELAYS IN TRANSMISSION OF,
      INFORMATION TO OR FROM USERS, INTERRUPTIONS IN TELECOMMUNICATIONS
      CONNECTIONS TO THE SITE OR SERVICES, OR VIRUSES, REGARDLESS OF THE CAUSE.
    </p>
    <p>
      8.2. <span className={styles.privacySpan}>Maximum Liability</span>
      {'. '} TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOTWITHSTANDING ANYTHING TO
      THE CONTRARY CONTAINED HEREIN, OUR LIABILITY TO YOU FOR ANY DAMAGES
      ARISING FROM OR RELATED TO THIS AGREEMENT, THE SITE, OR YOUR USE OF THE
      SERVICES, FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF THE
      ACTION, WILL AT ALL TIMES BE LIMITED TO A MAXIMUM OF THE AMOUNT OF FEES
      PAID BY YOU TO US OVER THE PRECEDING 12 MONTHS. THE EXISTENCE OF MORE THAN
      ONE CLAIM WILL NOT ENLARGE THIS LIMIT.
    </p>
    <p>
      8.3 <span className={styles.privacySpan}>Exclusions</span>
      {'. '} The limitations in Sections 8.1 and 8.2 shall not apply to the
      parties’ respective indemnification obligations or a breach of Section 5.
    </p>
    <h4>9. TERM AND TERMINATION</h4>
    <p>
      9.1. <span className={styles.privacySpan}>Term of Agreement</span>
      {'. '} This Agreement commences on the date You accept it and continues
      until the applicable User subscriptions granted in accordance with this
      Agreement have expired or been terminated and any account You have with Us
      is closed.
    </p>
    <p>
      9.2. <span className={styles.privacySpan}>Termination</span>
      {'. '} A party may terminate this Agreement for cause: (i) upon 30 days
      written notice to the other party of a material breach if such breach
      remains uncured at the expiration of such period, or (ii) if the other
      party becomes the subject of a petition in bankruptcy or any other
      proceeding relating to insolvency, receivership, liquidation, or
      assignment for the benefit of creditors. Notwithstanding the foregoing, We
      may terminate this agreement for any reason or no reason, with 14 days
      written notice to You.
    </p>
    <p>
      9.3. <span className={styles.privacySpan}>Surviving Provisions</span>
      {'. '} 4 (Proprietary Rights), 5 (Confidentiality), 6.2 (Disclaimer), 7
      (Mutual Indemnification), 8 (Limitation of Liability), 10 (Notices,
      Governing Law and Jurisdiction), and 11(General Provisions) shall survive
      any termination or expiration of this Agreement.
    </p>

    <h4>10. NOTICES, GOVERNING LAW AND JURISDICTION, AND ARBITRATION</h4>
    <p>
      10.1. <span className={styles.privacySpan}>Manner of Giving Notice</span>
      {'. '}
      We may send notices pursuant to this Agreement to You at the e-mail
      address we have on file for You, and such notices will be deemed received
      by You 24 hours after they are sent. You may send notices to Us pursuant
      to this Agreement to inquiries@buildee.com, and such notices will be
      deemed received 72 hours after they are sent.
    </p>
    <p>
      10.2.{' '}
      <span className={styles.privacySpan}>
        Agreement to Governing Law and Jurisdiction
      </span>
      . This Agreement, and all claims or causes of action (whether in contract,
      tort, or statute) that may be based upon, arise out of, or relate to this
      Agreement, shall be governed by, and enforced in accordance with, the
      internal laws of the State of Colorado, including its statutes of
      limitations. Each party consents to the exclusive jurisdiction of the
      federal and state courts located in Denver, Colorado USA for any dispute
      not subject to arbitration, if any.
    </p>
    <p>
      10.3. <span className={styles.privacySpan}>Dispute Resolution</span>
      {'. '}
      Except in situations in which injunctive relief is necessary, if any
      dispute arises between the parties in connection with this Agreement, the
      parties shall first attempt to resolve the dispute through good faith
      negotiations between parties authorized to settle the dispute on behalf of
      the parties. If such negotiations fail to resolve the dispute within
      thirty (30) days, each party shall have the right to commence binding
      arbitration in accordance with this Agreement.
    </p>
    <p>
      10.4. <span className={styles.privacySpan}>Arbitration</span>
      {'. '} Any dispute between You and Us, our agents, employees, officers,
      directors, principals, successors, assigns, subsidiaries, or affiliates
      arising from or relating to this Agreement and its interpretation or the
      breach, termination or validity thereof, the relationships which result
      from this Agreement, including disputes about the validity, scope or
      enforceability of this arbitration provision (collectively, “Covered
      Disputes”) will be settled by binding arbitration in accordance with the
      rules of the American Arbitration Association by a single arbitrator
      appointed in accordance with said rules. The arbitration shall take place
      in Denver, Colorado USA and the arbitrator will have the power to grant
      whatever relief would be available in court under law or in equity and any
      award of the arbitrator(s) will be final and binding on each of the
      parties and may be entered as a judgment in any court of competent
      jurisdiction. The arbitrator will apply applicable law and the provisions
      of this Agreement and the failure to do so will be deemed an excess of
      arbitral authority and grounds for judicial review. The parties agree that
      any Covered Dispute hereunder will be submitted to arbitration on an
      individual basis only. Neither Us nor You are entitled to arbitrate any
      Covered Dispute as a class, representative, or private attorney action and
      the arbitrator will have no authority to proceed on a class,
      representative, or private attorney general basis. If any provision of the
      agreement to arbitrate in this section is found illegal or unenforceable,
      the remaining arbitration terms shall continue to be fully valid, binding,
      and enforceable (but in no case will there be a class, representative or
      private attorney general arbitration).
    </p>
    <p>
      10.5. <span className={styles.privacySpan}>NO CLASS ACTION</span>
      {'. '} TO THE EXTENT ALLOWED BY LAW, YOU AND WE EACH WAIVE ANY RIGHT TO
      PURSUE DISPUTES ON A CLASS-WIDE BASIS, TO EITHER JOIN A CLAIM WITH THE
      CLAIM OF ANY OTHER PERSON OR ENTITY OR TO ASSERT A CLAIM IN A
      REPRESENTATIVE CAPACITY ON BEHALF OF ANYONE ELSE IN ANY LAWSUIT,
      ARBITRATION, OR OTHER PROCEEDING.
    </p>
    <p>
      10.6. <span className={styles.privacySpan}>NO TRIAL BY JURY</span>
      {'. '} TO THE EXTENT ALLOWED BY LAW, WE EACH WAIVE ANY
      RIGHTTOTRIALBYJURYINANYLAWSUIT,ARBITRATION, OROTHERPROCEEDING.
    </p>
    <h4>11. GENERAL PROVISIONS</h4>
    <p>
      11.1. <span className={styles.privacySpan}>Export Compliance</span>
      {'. '} You represent and warrant that You are not named on any U.S.
      government list of persons or entities prohibited from receiving exports.
      You shall comply with the export laws and regulations of the United States
      and other applicable jurisdictions in using the Services and You shall not
      permit Users to access or use Services in violation of any U.S. export
      embargo, prohibition, or restriction.
    </p>
    <p>
      11.2.{' '}
      <span className={styles.privacySpan}>Relationship of the Parties</span>
      {'. '}
      The parties are independent contractors. This Agreement does not create a
      partnership, franchise, joint venture, agency, fiduciary or employment
      relationship between the parties.
    </p>
    <p>
      11.3.{' '}
      <span className={styles.privacySpan}>No Third-Party Beneficiaries</span>
      {'. '}
      There are no third-party beneficiaries to this Agreement.
    </p>
    <p>
      11.4.{' '}
      <span className={styles.privacySpan}>Waiver and Cumulative Remedies</span>
      . No failure or delay by either party in exercising any right under this
      Agreement shall constitute a waiver of that right. Other than as expressly
      stated herein, the remedies provided herein are in addition to, and not
      exclusive of, any other remedies of a party at law or in equity.
    </p>
    <p>
      11.5. <span className={styles.privacySpan}>Severability</span>
      {'. '} If any provision of this Agreement is held by a court of competent
      jurisdiction to be contrary to law, the provision shall be modified by the
      court and interpreted so as best to accomplish the objectives of the
      original provision to the fullest extent permitted by law, and the
      remaining provisions of this Agreement shall remain in effect.
    </p>
    <p>
      11.6. <span className={styles.privacySpan}>Assignment</span>
      {'. '} Neither party may assign any of its rights or obligations
      hereunder, whether by operation of law or otherwise, without the prior
      written consent of the other party (not to be unreasonably withheld).
      Notwithstanding the foregoing, either party may assign this Agreement in
      its entirety, without consent of the other party, to its Affiliate or in
      connection with a merger, acquisition, corporate reorganization, or sale
      of all or substantially all of its assets not involving a direct
      competitor of the other party. A party’s sole remedy for any purported
      assignment by the other party in breach of this paragraph shall be, at the
      non-assigning party’s election, termination of this Agreement upon written
      notice to the assigning party. In the event of such a termination, We
      shall refund to You any prepaid fees covering the remainder of the term of
      all subscriptions after the effective date of termination. Subject to the
      foregoing, this Agreement shall bind and inure to the benefit of the
      parties, their respective successors, and permitted assigns.
    </p>
    <p>
      11.7.{' '}
      <span className={styles.privacySpan}>Entire Agreement; Modification</span>
      . Your Order, This Agreement, and any other written agreement entered into
      by You and Us that expressly relates to the Services, constitutesthe
      entire agreement between the parties and supersedes all prior and
      contemporaneous agreements, proposals, or representations, written or
      oral, concerning its subject matter. We may revise and update this
      Agreement at any time, in Our sole discretion by posting an amended
      version at the Site. Your continued use of the Services after any changes
      to this Agreement will mean You accept those changes.
    </p>
    <p>
      11.8. <span className={styles.privacySpan}>Force Majeure</span>
      {'. '} Neither party will incur any liability to the other party resulting
      from any delay or failure to perform all or any part of this Agreement if
      such delay or failure is caused, in whole or in part, by events,
      occurrences or forces beyond the reasonable control and without the
      negligence or other fault of such party.
    </p>
  </div>
)

export default ProfileTermsText
