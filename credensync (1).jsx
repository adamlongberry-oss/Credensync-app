import { useState, useEffect, useCallback } from "react";

const SECTIONS = [
  { id: "personal", label: "Personal Info", icon: "👤" },
  { id: "licenses", label: "State Licenses", icon: "📋" },
  { id: "dea", label: "DEA & NPI", icon: "🔑" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "certifications", label: "Certifications", icon: "✅" },
  { id: "work", label: "Work History", icon: "🏥" },
  { id: "malpractice", label: "Malpractice", icon: "🛡️" },
  { id: "privileges", label: "Privileges", icon: "🏛️" },
  { id: "references", label: "References", icon: "📞" },
  { id: "military", label: "Military", icon: "⭐" },
  { id: "documents", label: "Documents", icon: "📎" },
  { id: "disclosures", label: "Disclosures", icon: "📝" },
];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const emptyProfile = () => ({
  personal: {
    firstName: "", middleName: "", lastName: "", suffix: "",
    dob: "", ssn: "", gender: "",
    email: "", phone: "", fax: "",
    addressLine1: "", addressLine2: "", city: "", state: "", zip: "",
    mailingAddressLine1: "", mailingAddressLine2: "", mailingCity: "", mailingState: "", mailingZip: "",
    sameAsMailing: true,
  },
  licenses: [{ state: "", licenseNumber: "", type: "APRN", issueDate: "", expirationDate: "", status: "Active" }],
  dea: {
    npiNumber: "", npiEnumerationDate: "",
    deaNumber: "", deaExpirationDate: "", deaSchedules: "",
    deaState: "", stateControlledSubstanceLicense: "", stateCSExpiration: "",
  },
  education: [
    { type: "Nursing (BSN/ADN)", institution: "", city: "", state: "", degree: "", graduationDate: "", gpa: "" },
    { type: "Nurse Anesthesia (MSN/DNP/DNAP)", institution: "", city: "", state: "", degree: "", graduationDate: "", gpa: "" },
  ],
  certifications: [
    { name: "NBCRNA - National Certification", certNumber: "", issueDate: "", expirationDate: "", status: "Active" },
    { name: "BLS", certNumber: "", issueDate: "", expirationDate: "", status: "Active" },
    { name: "ACLS", certNumber: "", issueDate: "", expirationDate: "", status: "Active" },
    { name: "PALS", certNumber: "", issueDate: "", expirationDate: "", status: "" },
  ],
  work: [{ employer: "", facilityName: "", position: "", department: "", city: "", state: "", startDate: "", endDate: "", current: false, reasonForLeaving: "", contactName: "", contactPhone: "", hoursPerWeek: "" }],
  malpractice: {
    carrier: "", policyNumber: "", coverageType: "", perOccurrence: "", aggregate: "",
    effectiveDate: "", expirationDate: "",
    priorCarrier: "", priorPolicyNumber: "", priorEffective: "", priorExpiration: "",
    claims: [{ hasBeenSued: "No", details: "" }],
  },
  privileges: [{ facility: "", city: "", state: "", type: "", status: "Active", startDate: "", expirationDate: "", staffCategory: "" }],
  references: [{ name: "", title: "", specialty: "", organization: "", phone: "", email: "", relationship: "", yearsKnown: "" }],
  military: { served: "No", entries: [{ branch: "", rank: "", startDate: "", endDate: "", dischargeType: "", mos: "" }] },
  documents: {
    categories: [
      { id: "acls", label: "ACLS Card", files: [] },
      { id: "bls", label: "BLS Card", files: [] },
      { id: "pals", label: "PALS Card", files: [] },
      { id: "nrp", label: "NRP Card", files: [] },
      { id: "stateLicense", label: "State License / License Lookup", files: [] },
      { id: "immunizations", label: "Immunization Records", files: [] },
      { id: "driversLicense", label: "Driver's License", files: [] },
      { id: "diplomas", label: "Diplomas", files: [] },
      { id: "profCertificates", label: "Professional Certificates", files: [] },
      { id: "insurance", label: "Proof of Insurance", files: [] },
      { id: "other", label: "Other Documents", files: [] },
    ],
  },
  disclosures: {
    licenseRevoked: "No", licenseRevokedDetails: "",
    felonyConviction: "No", felonyDetails: "",
    substanceAbuse: "No", substanceDetails: "",
    lossOfPrivileges: "No", lossDetails: "",
    malpracticeSettlement: "No", malpracticeDetails: "",
    medicareExclusion: "No", medicareDetails: "",
    abilityToPerform: "Yes", abilityDetails: "",
  },
});

function Field({ label, value, onChange, type = "text", options, placeholder, half, third, required }) {
  const w = third ? "32%" : half ? "48.5%" : "100%";
  if (type === "select") {
    return (
      <div style={{ width: w, marginBottom: 14 }}>
        <label style={styles.label}>{label}{required && <span style={{ color: "#c0392b" }}> *</span>}</label>
        <select value={value || ""} onChange={e => onChange(e.target.value)} style={styles.input}>
          <option value="">Select...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (type === "textarea") {
    return (
      <div style={{ width: w, marginBottom: 14 }}>
        <label style={styles.label}>{label}{required && <span style={{ color: "#c0392b" }}> *</span>}</label>
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...styles.input, minHeight: 72, resize: "vertical", fontFamily: "inherit" }} />
      </div>
    );
  }
  return (
    <div style={{ width: w, marginBottom: 14 }}>
      <label style={styles.label}>{label}{required && <span style={{ color: "#c0392b" }}> *</span>}</label>
      <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={styles.input} />
    </div>
  );
}

function ArraySection({ items, setItems, renderItem, emptyItem, addLabel }) {
  const add = () => setItems([...items, typeof emptyItem === "function" ? emptyItem() : { ...emptyItem }]);
  const remove = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
  const update = (i, key, val) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  };
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={styles.arrayCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1a3c5e", letterSpacing: 0.5 }}>#{i + 1}</span>
            {items.length > 1 && (
              <button onClick={() => remove(i)} style={styles.removeBtn}>Remove</button>
            )}
          </div>
          {renderItem(item, i, (key, val) => update(i, key, val))}
        </div>
      ))}
      <button onClick={add} style={styles.addBtn}>+ {addLabel}</button>
    </div>
  );
}

function PersonalSection({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <div>
      <h3 style={styles.sectionSubhead}>Name</h3>
      <div style={styles.row}>
        <Field label="First Name" value={data.firstName} onChange={v => set("firstName", v)} half required />
        <Field label="Middle Name" value={data.middleName} onChange={v => set("middleName", v)} half />
      </div>
      <div style={styles.row}>
        <Field label="Last Name" value={data.lastName} onChange={v => set("lastName", v)} half required />
        <Field label="Suffix" value={data.suffix} onChange={v => set("suffix", v)} half placeholder="MD, DO, CRNA, etc." />
      </div>
      <h3 style={styles.sectionSubhead}>Demographics</h3>
      <div style={styles.row}>
        <Field label="Date of Birth" value={data.dob} onChange={v => set("dob", v)} type="date" half required />
        <Field label="Gender" value={data.gender} onChange={v => set("gender", v)} type="select" options={["Male", "Female", "Non-binary", "Prefer not to say"]} half />
      </div>
      <div style={styles.row}>
        <Field label="SSN" value={data.ssn} onChange={v => set("ssn", v)} half placeholder="XXX-XX-XXXX" required />
      </div>
      <h3 style={styles.sectionSubhead}>Contact</h3>
      <div style={styles.row}>
        <Field label="Email" value={data.email} onChange={v => set("email", v)} type="email" third required />
        <Field label="Phone" value={data.phone} onChange={v => set("phone", v)} third required />
        <Field label="Fax" value={data.fax} onChange={v => set("fax", v)} third />
      </div>
      <h3 style={styles.sectionSubhead}>Home Address</h3>
      <div style={styles.row}>
        <Field label="Address Line 1" value={data.addressLine1} onChange={v => set("addressLine1", v)} half required />
        <Field label="Address Line 2" value={data.addressLine2} onChange={v => set("addressLine2", v)} half />
      </div>
      <div style={styles.row}>
        <Field label="City" value={data.city} onChange={v => set("city", v)} third required />
        <Field label="State" value={data.state} onChange={v => set("state", v)} type="select" options={US_STATES} third required />
        <Field label="ZIP" value={data.zip} onChange={v => set("zip", v)} third required />
      </div>
      <div style={{ marginTop: 6, marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#4a6a8a" }}>
          <input type="checkbox" checked={data.sameAsMailing} onChange={e => set("sameAsMailing", e.target.checked)} />
          Mailing address same as home address
        </label>
      </div>
      {!data.sameAsMailing && (
        <>
          <h3 style={styles.sectionSubhead}>Mailing Address</h3>
          <div style={styles.row}>
            <Field label="Address Line 1" value={data.mailingAddressLine1} onChange={v => set("mailingAddressLine1", v)} half />
            <Field label="Address Line 2" value={data.mailingAddressLine2} onChange={v => set("mailingAddressLine2", v)} half />
          </div>
          <div style={styles.row}>
            <Field label="City" value={data.mailingCity} onChange={v => set("mailingCity", v)} third />
            <Field label="State" value={data.mailingState} onChange={v => set("mailingState", v)} type="select" options={US_STATES} third />
            <Field label="ZIP" value={data.mailingZip} onChange={v => set("mailingZip", v)} third />
          </div>
        </>
      )}
    </div>
  );
}

function LicensesSection({ data, setData }) {
  return (
    <ArraySection
      items={data} setItems={setData}
      emptyItem={{ state: "", licenseNumber: "", type: "APRN", issueDate: "", expirationDate: "", status: "Active" }}
      addLabel="Add License"
      renderItem={(item, i, update) => (
        <div style={styles.row}>
          <Field label="State" value={item.state} onChange={v => update("state", v)} type="select" options={US_STATES} third required />
          <Field label="License Number" value={item.licenseNumber} onChange={v => update("licenseNumber", v)} third required />
          <Field label="License Type" value={item.type} onChange={v => update("type", v)} type="select" options={["APRN", "RN", "LPN", "Other"]} third />
          <Field label="Issue Date" value={item.issueDate} onChange={v => update("issueDate", v)} type="date" third />
          <Field label="Expiration Date" value={item.expirationDate} onChange={v => update("expirationDate", v)} type="date" third required />
          <Field label="Status" value={item.status} onChange={v => update("status", v)} type="select" options={["Active", "Inactive", "Pending", "Expired", "Revoked"]} third />
        </div>
      )}
    />
  );
}

function DEASection({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <div>
      <h3 style={styles.sectionSubhead}>NPI</h3>
      <div style={styles.row}>
        <Field label="NPI Number" value={data.npiNumber} onChange={v => set("npiNumber", v)} half required />
        <Field label="Enumeration Date" value={data.npiEnumerationDate} onChange={v => set("npiEnumerationDate", v)} type="date" half />
      </div>
      <h3 style={styles.sectionSubhead}>DEA Registration</h3>
      <div style={styles.row}>
        <Field label="DEA Number" value={data.deaNumber} onChange={v => set("deaNumber", v)} half />
        <Field label="DEA Expiration" value={data.deaExpirationDate} onChange={v => set("deaExpirationDate", v)} type="date" half />
      </div>
      <div style={styles.row}>
        <Field label="DEA State" value={data.deaState} onChange={v => set("deaState", v)} type="select" options={US_STATES} half />
        <Field label="Schedules" value={data.deaSchedules} onChange={v => set("deaSchedules", v)} half placeholder="II, II-N, III, III-N, IV, V" />
      </div>
      <h3 style={styles.sectionSubhead}>State Controlled Substance</h3>
      <div style={styles.row}>
        <Field label="State CS License" value={data.stateControlledSubstanceLicense} onChange={v => set("stateControlledSubstanceLicense", v)} half />
        <Field label="CS Expiration" value={data.stateCSExpiration} onChange={v => set("stateCSExpiration", v)} type="date" half />
      </div>
    </div>
  );
}

function EducationSection({ data, setData }) {
  return (
    <ArraySection
      items={data} setItems={setData}
      emptyItem={() => ({ type: "", institution: "", city: "", state: "", degree: "", graduationDate: "", gpa: "" })}
      addLabel="Add Education"
      renderItem={(item, i, update) => (
        <div>
          <div style={styles.row}>
            <Field label="Program Type" value={item.type} onChange={v => update("type", v)} type="select" options={["Nursing (BSN/ADN)", "Nurse Anesthesia (MSN/DNP/DNAP)", "Undergraduate", "Graduate", "Doctoral", "Other"]} half required />
            <Field label="Degree" value={item.degree} onChange={v => update("degree", v)} half placeholder="BSN, MSN, DNP, DNAP..." required />
          </div>
          <div style={styles.row}>
            <Field label="Institution" value={item.institution} onChange={v => update("institution", v)} half required />
            <Field label="Graduation Date" value={item.graduationDate} onChange={v => update("graduationDate", v)} type="date" half required />
          </div>
          <div style={styles.row}>
            <Field label="City" value={item.city} onChange={v => update("city", v)} third />
            <Field label="State" value={item.state} onChange={v => update("state", v)} type="select" options={US_STATES} third />
            <Field label="GPA" value={item.gpa} onChange={v => update("gpa", v)} third />
          </div>
        </div>
      )}
    />
  );
}

function CertificationsSection({ data, setData }) {
  return (
    <ArraySection
      items={data} setItems={setData}
      emptyItem={{ name: "", certNumber: "", issueDate: "", expirationDate: "", status: "Active" }}
      addLabel="Add Certification"
      renderItem={(item, i, update) => (
        <div style={styles.row}>
          <Field label="Certification" value={item.name} onChange={v => update("name", v)} half required />
          <Field label="Certificate Number" value={item.certNumber} onChange={v => update("certNumber", v)} half />
          <Field label="Issue Date" value={item.issueDate} onChange={v => update("issueDate", v)} type="date" third />
          <Field label="Expiration Date" value={item.expirationDate} onChange={v => update("expirationDate", v)} type="date" third required />
          <Field label="Status" value={item.status} onChange={v => update("status", v)} type="select" options={["Active", "Inactive", "Pending", "Expired"]} third />
        </div>
      )}
    />
  );
}

function WorkSection({ data, setData }) {
  return (
    <ArraySection
      items={data} setItems={setData}
      emptyItem={{ employer: "", facilityName: "", position: "", department: "", city: "", state: "", startDate: "", endDate: "", current: false, reasonForLeaving: "", contactName: "", contactPhone: "", hoursPerWeek: "" }}
      addLabel="Add Position"
      renderItem={(item, i, update) => (
        <div>
          <div style={styles.row}>
            <Field label="Employer / Staffing Company" value={item.employer} onChange={v => update("employer", v)} half required />
            <Field label="Facility / Institution Name" value={item.facilityName} onChange={v => update("facilityName", v)} half placeholder="Hospital, surgery center, etc." />
          </div>
          <div style={styles.row}>
            <Field label="Position / Title" value={item.position} onChange={v => update("position", v)} third required />
            <Field label="Department" value={item.department} onChange={v => update("department", v)} third />
            <Field label="State" value={item.state} onChange={v => update("state", v)} type="select" options={US_STATES} third />
          </div>
          <div style={styles.row}>
            <Field label="City" value={item.city} onChange={v => update("city", v)} third />
            <Field label="Start Date" value={item.startDate} onChange={v => update("startDate", v)} type="date" third required />
            <Field label="End Date" value={item.endDate} onChange={v => update("endDate", v)} type="date" third />
          </div>
          <div style={styles.row}>
            <Field label="Hours / Week" value={item.hoursPerWeek} onChange={v => update("hoursPerWeek", v)} third />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#4a6a8a" }}>
              <input type="checkbox" checked={item.current} onChange={e => update("current", e.target.checked)} />
              Currently employed here
            </label>
          </div>
          <div style={styles.row}>
            <Field label="Contact Name" value={item.contactName} onChange={v => update("contactName", v)} third />
            <Field label="Contact Phone" value={item.contactPhone} onChange={v => update("contactPhone", v)} third />
            <Field label="Reason for Leaving" value={item.reasonForLeaving} onChange={v => update("reasonForLeaving", v)} third />
          </div>
        </div>
      )}
    />
  );
}

function MalpracticeSection({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  return (
    <div>
      <h3 style={styles.sectionSubhead}>Current Coverage</h3>
      <div style={styles.row}>
        <Field label="Insurance Carrier" value={data.carrier} onChange={v => set("carrier", v)} half required />
        <Field label="Policy Number" value={data.policyNumber} onChange={v => set("policyNumber", v)} half required />
      </div>
      <div style={styles.row}>
        <Field label="Coverage Type" value={data.coverageType} onChange={v => set("coverageType", v)} type="select" options={["Occurrence", "Claims-Made", "Tail Coverage"]} third />
        <Field label="Per Occurrence ($)" value={data.perOccurrence} onChange={v => set("perOccurrence", v)} third placeholder="1,000,000" />
        <Field label="Aggregate ($)" value={data.aggregate} onChange={v => set("aggregate", v)} third placeholder="3,000,000" />
      </div>
      <div style={styles.row}>
        <Field label="Effective Date" value={data.effectiveDate} onChange={v => set("effectiveDate", v)} type="date" half />
        <Field label="Expiration Date" value={data.expirationDate} onChange={v => set("expirationDate", v)} type="date" half required />
      </div>
      <h3 style={styles.sectionSubhead}>Prior Coverage</h3>
      <div style={styles.row}>
        <Field label="Prior Carrier" value={data.priorCarrier} onChange={v => set("priorCarrier", v)} half />
        <Field label="Prior Policy #" value={data.priorPolicyNumber} onChange={v => set("priorPolicyNumber", v)} half />
      </div>
      <div style={styles.row}>
        <Field label="Prior Effective" value={data.priorEffective} onChange={v => set("priorEffective", v)} type="date" half />
        <Field label="Prior Expiration" value={data.priorExpiration} onChange={v => set("priorExpiration", v)} type="date" half />
      </div>
      <h3 style={styles.sectionSubhead}>Claims History</h3>
      <div style={styles.row}>
        <Field label="Have you ever been named in a malpractice suit?" value={data.claims[0]?.hasBeenSued} onChange={v => set("claims", [{ ...data.claims[0], hasBeenSued: v }])} type="select" options={["No", "Yes"]} half />
      </div>
      {data.claims[0]?.hasBeenSued === "Yes" && (
        <Field label="Details" value={data.claims[0]?.details} onChange={v => set("claims", [{ ...data.claims[0], details: v }])} type="textarea" placeholder="Provide details including dates, jurisdiction, outcome..." />
      )}
    </div>
  );
}

function PrivilegesSection({ data, setData }) {
  return (
    <ArraySection
      items={data} setItems={setData}
      emptyItem={{ facility: "", city: "", state: "", type: "", status: "Active", startDate: "", expirationDate: "", staffCategory: "" }}
      addLabel="Add Facility"
      renderItem={(item, i, update) => (
        <div style={styles.row}>
          <Field label="Facility Name" value={item.facility} onChange={v => update("facility", v)} half required />
          <Field label="Staff Category" value={item.staffCategory} onChange={v => update("staffCategory", v)} type="select" options={["Active", "Courtesy", "Consulting", "Temporary", "Locum Tenens", "Allied Health"]} half />
          <Field label="City" value={item.city} onChange={v => update("city", v)} third />
          <Field label="State" value={item.state} onChange={v => update("state", v)} type="select" options={US_STATES} third />
          <Field label="Privilege Type" value={item.type} onChange={v => update("type", v)} type="select" options={["Full", "Temporary", "Provisional", "Emergency", "Telemedicine"]} third />
          <Field label="Start Date" value={item.startDate} onChange={v => update("startDate", v)} type="date" third />
          <Field label="Expiration" value={item.expirationDate} onChange={v => update("expirationDate", v)} type="date" third />
          <Field label="Status" value={item.status} onChange={v => update("status", v)} type="select" options={["Active", "Inactive", "Pending", "Expired", "Resigned", "Revoked"]} third />
        </div>
      )}
    />
  );
}

function ReferencesSection({ data, setData }) {
  return (
    <ArraySection
      items={data} setItems={setData}
      emptyItem={{ name: "", title: "", specialty: "", organization: "", phone: "", email: "", relationship: "", yearsKnown: "" }}
      addLabel="Add Reference"
      renderItem={(item, i, update) => (
        <div>
          <div style={styles.row}>
            <Field label="Full Name" value={item.name} onChange={v => update("name", v)} half required />
            <Field label="Title" value={item.title} onChange={v => update("title", v)} half />
          </div>
          <div style={styles.row}>
            <Field label="Specialty" value={item.specialty} onChange={v => update("specialty", v)} third />
            <Field label="Organization" value={item.organization} onChange={v => update("organization", v)} third />
            <Field label="Relationship" value={item.relationship} onChange={v => update("relationship", v)} third />
          </div>
          <div style={styles.row}>
            <Field label="Phone" value={item.phone} onChange={v => update("phone", v)} third required />
            <Field label="Email" value={item.email} onChange={v => update("email", v)} third />
            <Field label="Years Known" value={item.yearsKnown} onChange={v => update("yearsKnown", v)} third />
          </div>
        </div>
      )}
    />
  );
}

function MilitarySection({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const entries = data.entries || [{ branch: "", rank: "", startDate: "", endDate: "", dischargeType: "", mos: "" }];
  const setEntries = (newEntries) => set("entries", newEntries);

  const BRANCHES = ["Air Force", "Army", "Coast Guard", "Marine Corps", "Navy", "Space Force", "Air Force Reserve", "Army Reserve", "Coast Guard Reserve", "Marine Corps Reserve", "Navy Reserve", "Air National Guard", "Army National Guard"];

  return (
    <div>
      <div style={styles.row}>
        <Field label="Have you served in the U.S. Military?" value={data.served} onChange={v => set("served", v)} type="select" options={["No", "Yes"]} half />
      </div>
      {data.served === "Yes" && (
        <ArraySection
          items={entries}
          setItems={setEntries}
          emptyItem={{ branch: "", rank: "", startDate: "", endDate: "", dischargeType: "", mos: "" }}
          addLabel="Add Service Entry"
          renderItem={(item, i, update) => (
            <div>
              <div style={styles.row}>
                <Field label="Branch" value={item.branch} onChange={v => update("branch", v)} type="select" options={BRANCHES} half required />
                <Field label="Rank at Separation" value={item.rank} onChange={v => update("rank", v)} half />
              </div>
              <div style={styles.row}>
                <Field label="MOS / AFSC / Rate" value={item.mos} onChange={v => update("mos", v)} third placeholder="e.g., 4N0X1, 68W" />
                <Field label="Start Date" value={item.startDate} onChange={v => update("startDate", v)} type="date" third />
                <Field label="End Date" value={item.endDate} onChange={v => update("endDate", v)} type="date" third />
              </div>
              <div style={styles.row}>
                <Field label="Discharge Type" value={item.dischargeType} onChange={v => update("dischargeType", v)} type="select" options={["Honorable", "General (Under Honorable)", "Other Than Honorable", "Bad Conduct", "Still Serving"]} half />
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}

const DOC_CATEGORIES = [
  { id: "acls", label: "ACLS Card" },
  { id: "bls", label: "BLS Card" },
  { id: "pals", label: "PALS Card" },
  { id: "nrp", label: "NRP Card" },
  { id: "stateLicense", label: "State License / License Lookup" },
  { id: "immunizations", label: "Immunization Records" },
  { id: "driversLicense", label: "Driver's License" },
  { id: "diplomas", label: "Diplomas" },
  { id: "profCertificates", label: "Professional Certificates" },
  { id: "insurance", label: "Proof of Insurance" },
  { id: "other", label: "Other Documents" },
];

function DocumentsSection({ data, setData }) {
  const categories = data.categories || DOC_CATEGORIES.map(c => ({ ...c, files: [] }));

  const handleUpload = (catId, e) => {
    const fileList = Array.from(e.target.files);
    if (!fileList.length) return;

    const readers = fileList.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            data: evt.target.result,
            uploadedAt: new Date().toISOString(),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newFiles => {
      const updated = categories.map(cat => {
        if (cat.id === catId) {
          return { ...cat, files: [...(cat.files || []), ...newFiles] };
        }
        return cat;
      });
      setData({ ...data, categories: updated });
    });

    e.target.value = "";
  };

  const removeFile = (catId, fileIndex) => {
    const updated = categories.map(cat => {
      if (cat.id === catId) {
        return { ...cat, files: cat.files.filter((_, i) => i !== fileIndex) };
      }
      return cat;
    });
    setData({ ...data, categories: updated });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const totalFiles = categories.reduce((sum, cat) => sum + (cat.files?.length || 0), 0);

  return (
    <div>
      <p style={{ fontSize: 13, color: "#6a8aaa", marginBottom: 18, lineHeight: 1.5 }}>
        Upload copies of your credentials and supporting documents. These will be stored with your profile and available for credentialing submissions.
        <br /><span style={{ fontWeight: 600 }}>{totalFiles} document{totalFiles !== 1 ? "s" : ""} uploaded</span>
      </p>
      {categories.map(cat => {
        const catDef = DOC_CATEGORIES.find(d => d.id === cat.id) || { label: cat.id };
        const fileCount = cat.files?.length || 0;
        return (
          <div key={cat.id} style={{
            background: fileCount > 0 ? "#f0f7f0" : "#f8fbff",
            border: `1px solid ${fileCount > 0 ? "#c0e0c0" : "#e0eaf4"}`,
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 10,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1a3c5e" }}>{catDef.label}</span>
                {fileCount > 0 && (
                  <span style={{ fontSize: 11, background: "#27ae60", color: "#fff", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>
                    {fileCount}
                  </span>
                )}
              </div>
              <label style={{
                fontSize: 12, fontWeight: 500, color: "#1a5cb0", cursor: "pointer",
                padding: "4px 12px", borderRadius: 6, border: "1px solid #a0c0e0", background: "#eaf2fc",
              }}>
                + Upload
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.tiff,.bmp" onChange={e => handleUpload(cat.id, e)} style={{ display: "none" }} />
              </label>
            </div>
            {fileCount > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {cat.files.map((file, fi) => (
                  <div key={fi} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#fff", border: "1px solid #e0eaf4", borderRadius: 6, padding: "6px 10px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14 }}>{file.type?.includes("pdf") ? "📄" : file.type?.includes("image") ? "🖼️" : "📎"}</span>
                      <span style={{ fontSize: 12, color: "#2c3e50", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                      <span style={{ fontSize: 11, color: "#8a9ab0", flexShrink: 0 }}>{formatSize(file.size)}</span>
                    </div>
                    <button onClick={() => removeFile(cat.id, fi)} style={{
                      background: "none", border: "none", color: "#c0392b", fontSize: 14, cursor: "pointer", padding: "2px 6px", flexShrink: 0,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DisclosuresSection({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const questions = [
    { key: "licenseRevoked", detailKey: "licenseRevokedDetails", q: "Has your license, certification, or registration to practice ever been denied, revoked, suspended, reduced, limited, or not renewed?" },
    { key: "felonyConviction", detailKey: "felonyDetails", q: "Have you ever been convicted of or pled guilty/no contest to a felony?" },
    { key: "substanceAbuse", detailKey: "substanceDetails", q: "Do you currently use or have you ever been treated for substance abuse or chemical dependency?" },
    { key: "lossOfPrivileges", detailKey: "lossDetails", q: "Have your clinical privileges or membership at any facility ever been denied, revoked, suspended, or voluntarily relinquished?" },
    { key: "malpracticeSettlement", detailKey: "malpracticeDetails", q: "Have you ever been a party to a malpractice settlement or judgment?" },
    { key: "medicareExclusion", detailKey: "medicareDetails", q: "Have you ever been excluded, sanctioned, or debarred from Medicare, Medicaid, or any federal program?" },
  ];
  return (
    <div>
      <p style={{ fontSize: 13, color: "#6a8aaa", marginBottom: 18, lineHeight: 1.5 }}>
        Please answer each question honestly. Answering "Yes" does not automatically disqualify you — details will be reviewed in context.
      </p>
      {questions.map(({ key, detailKey, q }) => (
        <div key={key} style={{ marginBottom: 16, padding: "12px 14px", background: data[key] === "Yes" ? "#fff5f5" : "#f0f7f0", borderRadius: 8, border: `1px solid ${data[key] === "Yes" ? "#e8c0c0" : "#c0e0c0"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#2c3e50", lineHeight: 1.5, flex: 1 }}>{q}</span>
            <select value={data[key]} onChange={e => set(key, e.target.value)} style={{ ...styles.input, width: 80, marginBottom: 0 }}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
          {data[key] === "Yes" && (
            <div style={{ marginTop: 10 }}>
              <textarea value={data[detailKey]} onChange={e => set(detailKey, e.target.value)} placeholder="Please provide details..." style={{ ...styles.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
            </div>
          )}
        </div>
      ))}
      <div style={{ marginTop: 8, padding: "12px 14px", background: data.abilityToPerform === "No" ? "#fff5f5" : "#f0f7f0", borderRadius: 8, border: `1px solid ${data.abilityToPerform === "No" ? "#e8c0c0" : "#c0e0c0"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#2c3e50", lineHeight: 1.5, flex: 1 }}>Are you able to perform the essential functions of a CRNA with or without reasonable accommodation?</span>
          <select value={data.abilityToPerform} onChange={e => set("abilityToPerform", e.target.value)} style={{ ...styles.input, width: 80, marginBottom: 0 }}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        {data.abilityToPerform === "No" && (
          <div style={{ marginTop: 10 }}>
            <textarea value={data.abilityDetails} onChange={e => set("abilityDetails", e.target.value)} placeholder="Please provide details..." style={{ ...styles.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function getCompletionStats(profile) {
  let total = 0, filled = 0;
  const check = (val) => { total++; if (val && val !== "" && val !== false) filled++; };
  const p = profile.personal;
  ["firstName", "lastName", "dob", "ssn", "email", "phone", "addressLine1", "city", "state", "zip"].forEach(k => check(p[k]));
  profile.licenses.forEach(l => { check(l.state); check(l.licenseNumber); check(l.expirationDate); });
  check(profile.dea.npiNumber);
  profile.education.forEach(e => { check(e.institution); check(e.degree); check(e.graduationDate); });
  profile.certifications.forEach(c => { check(c.name); check(c.expirationDate); });
  profile.work.forEach(w => { check(w.employer); check(w.position); check(w.startDate); });
  check(profile.malpractice.carrier); check(profile.malpractice.policyNumber); check(profile.malpractice.expirationDate);
  return { total, filled, pct: total > 0 ? Math.round((filled / total) * 100) : 0 };
}

function getExpiringItems(profile) {
  const items = [];
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 90);
  const checkDate = (expStr, label) => {
    if (!expStr) return;
    const d = new Date(expStr);
    if (d <= soon && d >= now) items.push({ label, date: expStr, daysLeft: Math.ceil((d - now) / 86400000) });
    else if (d < now) items.push({ label, date: expStr, daysLeft: -1 });
  };
  profile.licenses.forEach((l, i) => checkDate(l.expirationDate, `${l.state || "State"} License ${l.licenseNumber || ""}`));
  checkDate(profile.dea.deaExpirationDate, "DEA Registration");
  checkDate(profile.dea.stateCSExpiration, "State CS License");
  profile.certifications.forEach(c => checkDate(c.expirationDate, c.name || "Certification"));
  checkDate(profile.malpractice.expirationDate, "Malpractice Insurance");
  profile.privileges.forEach(p => checkDate(p.expirationDate, `Privileges - ${p.facility || "Facility"}`));
  return items.sort((a, b) => a.daysLeft - b.daysLeft);
}

export default function CredenSync() {
  const [profile, setProfile] = useState(emptyProfile);
  const [activeSection, setActiveSection] = useState("personal");
  const [saved, setSaved] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState(null);

  // Load profile from persistent storage on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const result = await window.storage.get("credensync-profile");
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setProfile(prev => ({ ...emptyProfile(), ...parsed }));
        }
      } catch (e) {
        // No saved profile yet — that's fine
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Auto-save to persistent storage on every change (debounced)
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      try {
        await window.storage.set("credensync-profile", JSON.stringify(profile));
      } catch (e) {
        console.error("Auto-save failed:", e);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [profile, loading]);

  const updateSection = useCallback((section, data) => {
    setProfile(prev => ({ ...prev, [section]: data }));
    setSaved(false);
  }, []);

  const saveProfile = async () => {
    try {
      await window.storage.set("credensync-profile", JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Save failed:", e);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        setProfile({ ...emptyProfile(), ...data });
        try {
          await window.storage.set("credensync-profile", JSON.stringify({ ...emptyProfile(), ...data }));
        } catch (se) {}
        setImportStatus("success");
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err) {
        setImportStatus("error");
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const resetProfile = async () => {
    if (confirm("Are you sure? This will erase all profile data.")) {
      setProfile(emptyProfile());
      try { await window.storage.delete("credensync-profile"); } catch (e) {}
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `credensync_${profile.personal.lastName || "profile"}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = getCompletionStats(profile);
  const expiring = getExpiringItems(profile);
  const displayName = profile.personal.firstName
    ? `${profile.personal.firstName} ${profile.personal.lastName}${profile.personal.suffix ? ", " + profile.personal.suffix : ""}`
    : "New Provider";

  const renderSection = () => {
    switch (activeSection) {
      case "personal": return <PersonalSection data={profile.personal} setData={d => updateSection("personal", d)} />;
      case "licenses": return <LicensesSection data={profile.licenses} setData={d => updateSection("licenses", d)} />;
      case "dea": return <DEASection data={profile.dea} setData={d => updateSection("dea", d)} />;
      case "education": return <EducationSection data={profile.education} setData={d => updateSection("education", d)} />;
      case "certifications": return <CertificationsSection data={profile.certifications} setData={d => updateSection("certifications", d)} />;
      case "work": return <WorkSection data={profile.work} setData={d => updateSection("work", d)} />;
      case "malpractice": return <MalpracticeSection data={profile.malpractice} setData={d => updateSection("malpractice", d)} />;
      case "privileges": return <PrivilegesSection data={profile.privileges} setData={d => updateSection("privileges", d)} />;
      case "references": return <ReferencesSection data={profile.references} setData={d => updateSection("references", d)} />;
      case "military": return <MilitarySection data={profile.military} setData={d => updateSection("military", d)} />;
      case "documents": return <DocumentsSection data={profile.documents} setData={d => updateSection("documents", d)} />;
      case "disclosures": return <DisclosuresSection data={profile.disclosures} setData={d => updateSection("disclosures", d)} />;
      default: return null;
    }
  };

  const sectionMeta = SECTIONS.find(s => s.id === activeSection);

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #2a7de1 !important; box-shadow: 0 0 0 3px rgba(42,125,225,0.12); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #c0d0e0; border-radius: 3px; }
        select { cursor: pointer; }
      `}</style>

      {/* Import status banner */}
      {importStatus && (
        <div style={{
          position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
          padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 200,
          background: importStatus === "success" ? "#27ae60" : "#c0392b", color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s ease",
        }}>
          {importStatus === "success" ? "✓ Profile imported successfully" : "✗ Import failed — invalid JSON file"}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(244,247,251,0.95)", zIndex: 300,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <div style={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="6" stroke="#1a5cb0" strokeWidth="2.5" />
              <path d="M9 14.5L12.5 18L19 10" stroke="#1a5cb0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: "#4a6a8a" }}>Loading your profile...</p>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={styles.logo}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="24" height="24" rx="6" stroke="white" strokeWidth="2.5" />
                <path d="M9 14.5L12.5 18L19 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 style={styles.headerTitle}>CredenSync</h1>
              <p style={styles.headerSub}>Provider Credentialing Profile</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={{ ...styles.headerBtn, cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
              ↑ Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            </label>
            <button onClick={exportJSON} style={styles.headerBtn} title="Export profile as JSON">
              ↓ Export
            </button>
            <button onClick={saveProfile} style={{ ...styles.headerBtn, background: saved ? "#27ae60" : "rgba(255,255,255,0.15)" }}>
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div style={styles.body}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <button
            onClick={() => setShowDashboard(true)}
            style={{
              ...styles.navItem,
              background: showDashboard ? "#eaf2fc" : "transparent",
              color: showDashboard ? "#1a5cb0" : "#4a6a8a",
              fontWeight: showDashboard ? 600 : 400,
              marginBottom: 8,
              borderBottom: "1px solid #e0eaf4",
              paddingBottom: 12,
            }}
          >
            <span style={{ fontSize: 16 }}>📊</span>
            <span>Dashboard</span>
          </button>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiveSection(s.id); setShowDashboard(false); }}
              style={{
                ...styles.navItem,
                background: !showDashboard && activeSection === s.id ? "#eaf2fc" : "transparent",
                color: !showDashboard && activeSection === s.id ? "#1a5cb0" : "#4a6a8a",
                fontWeight: !showDashboard && activeSection === s.id ? 600 : 400,
              }}
            >
              <span style={{ fontSize: 15 }}>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={styles.main}>
          {showDashboard ? (
            <div>
              <h2 style={styles.mainTitle}>Welcome{profile.personal.firstName ? `, ${profile.personal.firstName}` : ""}</h2>
              <p style={{ fontSize: 14, color: "#6a8aaa", marginBottom: 24 }}>
                Your single source of truth for all credentialing data. Fill out each section once — CredenSync handles the rest.
                <br /><span style={{ fontSize: 12, color: "#27ae60" }}>✓ Auto-saving enabled — your data persists between sessions</span>
              </p>

              {/* Completion bar */}
              <div style={styles.dashCard}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#1a3c5e" }}>Profile Completion</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: stats.pct >= 80 ? "#27ae60" : stats.pct >= 40 ? "#e67e22" : "#c0392b" }}>{stats.pct}%</span>
                </div>
                <div style={{ background: "#e8f0f8", borderRadius: 6, height: 10, overflow: "hidden" }}>
                  <div style={{ width: `${stats.pct}%`, height: "100%", background: stats.pct >= 80 ? "linear-gradient(90deg, #27ae60, #2ecc71)" : stats.pct >= 40 ? "linear-gradient(90deg, #e67e22, #f39c12)" : "linear-gradient(90deg, #c0392b, #e74c3c)", borderRadius: 6, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: 12, color: "#8a9ab0", marginTop: 6 }}>{stats.filled} of {stats.total} key fields completed</p>
              </div>

              {/* Alerts */}
              {expiring.length > 0 && (
                <div style={{ ...styles.dashCard, background: "#fff8f0", border: "1px solid #f0d8b8" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#c0392b", marginBottom: 10 }}>⚠ Expiration Alerts</h3>
                  {expiring.map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < expiring.length - 1 ? "1px solid #f0e0d0" : "none", fontSize: 13 }}>
                      <span style={{ color: "#4a3a2a" }}>{item.label}</span>
                      <span style={{ color: item.daysLeft < 0 ? "#c0392b" : item.daysLeft < 30 ? "#e67e22" : "#8a7a6a", fontWeight: 600 }}>
                        {item.daysLeft < 0 ? "EXPIRED" : `${item.daysLeft} days`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick nav */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSection(s.id); setShowDashboard(false); }}
                    style={styles.quickNav}
                  >
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#3a5a7a" }}>{s.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e8f0f8", display: "flex", justifyContent: "flex-end" }}>
                <button onClick={resetProfile} style={{ background: "none", border: "1px solid #e0c0c0", color: "#c0392b", fontSize: 12, padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit" }}>
                  Reset All Data
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <button onClick={() => setShowDashboard(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6a8aaa" }}>← Dashboard</button>
              </div>
              <h2 style={styles.mainTitle}>{sectionMeta?.icon} {sectionMeta?.label}</h2>
              <div style={{ marginTop: 20 }}>
                {renderSection()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f4f7fb",
    minHeight: "100vh",
    color: "#1a2a3a",
  },
  header: {
    background: "linear-gradient(135deg, #0f2a4a 0%, #1a4a7a 50%, #1a5cb0 100%)",
    padding: "0 24px",
    height: 64,
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
  },
  headerInner: {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 20,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    padding: "6px 16px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  body: {
    display: "flex",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 24px",
    gap: 20,
    minHeight: "calc(100vh - 64px)",
  },
  sidebar: {
    width: 200,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    position: "sticky",
    top: 84,
    alignSelf: "flex-start",
    background: "#fff",
    borderRadius: 12,
    padding: "12px 8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e8f0f8",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    textAlign: "left",
    transition: "all 0.15s",
    width: "100%",
  },
  main: {
    flex: 1,
    background: "#fff",
    borderRadius: 12,
    padding: "28px 32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e8f0f8",
    minHeight: 600,
  },
  mainTitle: {
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontSize: 22,
    fontWeight: 600,
    color: "#0f2a4a",
    letterSpacing: -0.3,
  },
  sectionSubhead: {
    fontSize: 13,
    fontWeight: 600,
    color: "#1a5cb0",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 20,
    paddingBottom: 6,
    borderBottom: "1px solid #e8f0f8",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0 12px",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 500,
    color: "#4a6a8a",
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid #d0dce8",
    borderRadius: 6,
    background: "#fafcff",
    color: "#1a2a3a",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  arrayCard: {
    background: "#f8fbff",
    border: "1px solid #e0eaf4",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 12,
  },
  removeBtn: {
    background: "none",
    border: "1px solid #e0c0c0",
    color: "#c0392b",
    fontSize: 11,
    padding: "3px 10px",
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  addBtn: {
    background: "#eaf2fc",
    border: "1px dashed #a0c0e0",
    color: "#1a5cb0",
    fontSize: 13,
    fontWeight: 500,
    padding: "10px 20px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    width: "100%",
    transition: "all 0.15s",
  },
  dashCard: {
    background: "#f8fbff",
    border: "1px solid #e0eaf4",
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 16,
  },
  quickNav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "14px 10px",
    width: 100,
    background: "#f8fbff",
    border: "1px solid #e0eaf4",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
};
