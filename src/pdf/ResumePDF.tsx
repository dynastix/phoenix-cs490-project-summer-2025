// import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

// const styles = StyleSheet.create({
//   page: {
//     padding: 30,
//     fontSize: 12,
//     fontFamily: 'Helvetica',
//     lineHeight: 1.5,
//   },
// });

// export default function ResumePDF({ content }: { content: string }) {
//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         <Text>{content}</Text>
//       </Page>
//     </Document>
//   );
// }

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Optional: Use a cleaner system font
Font.register({
  family: 'Helvetica',
  fonts: [
    {
      src: undefined,
      fontWeight: 'normal',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: 10,
    marginBottom: 10,
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#000',
    paddingBottom: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  jobEntry: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jobTitle: {
    fontWeight: 'bold',
  },
  companyLine: {
    fontSize: 10,
    marginBottom: 2,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default function ResumePDF({ content }: { content: string }) {
  // Split content into sections
  const sections = content.split(/\n\s*\n/);
  const name = sections[0];
  const contact = sections[1];
  const summary = sections.find((s) =>
    /professional summary/i.test(s)
  );

  const experience = sections.find((s) =>
    /experience/i.test(s)
  );

  const skills = sections.find((s) =>
    /skills/i.test(s)
  );

  const education = sections.find((s) =>
    /education/i.test(s)
  );

  // Helper to render bullet points
  const renderBullets = (text: string) => {
    return text
      .split(/\n/)
      .filter((line) => line.trim().startsWith('•'))
      .map((line, i) => (
        <Text key={i} style={styles.bullet}>
          {line.trim()}
        </Text>
      ));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.contact}>{contact}</Text>

        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text>{summary.replace(/^Professional Summary:\s*/i, '').trim()}</Text>
          </View>
        )}

        {experience && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>
                <Text>{experience}</Text>
            </View>
            )}

        {skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{skills.replace(/^Skills:\s*/i, '').trim()}</Text>
          </View>
        )}

        {education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <Text>{education.replace(/^Education:\s*/i, '').trim()}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

