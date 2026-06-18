import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API = 'https://backend-production-6077.up.railway.app';

export default function JobsScreen({ onBack }: { onBack: () => void }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/jobs/?limit=20&page=${p}`);
      const data = await res.json();
      if (p === 1) setJobs(data.jobs || []);
      else setJobs(prev => [...prev, ...(data.jobs || [])]);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  const openJob = (url: string) => {
    Linking.openURL(url);
  };

  const formatSalary = (salary: string) => {
    if (!salary) return 'Тохиролцоно';
    return salary + '₮';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <LinearGradient colors={['#1A0A3E', '#080618']} style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Буцах</Text>
        </TouchableOpacity>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Ажлын зар 💼</Text>
            <Text style={styles.sub}>Zangia.mn-с шинэ ажлын байрууд</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{jobs.length}</Text>
            <Text style={styles.countLabel}>зар</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>ШИНЭ АЖЛЫН БАЙРУУД</Text>

        {loading && jobs.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text style={styles.loadingText}>Zangia.mn-с татаж байна...</Text>
          </View>
        ) : (
          <>
            {jobs.map((job, i) => (
              <TouchableOpacity
                key={i}
                style={styles.jobCard}
                onPress={() => openJob(job.url)}
                activeOpacity={0.75}
              >
                {/* Accent */}
                <View style={styles.accentBar} />

                <View style={styles.jobTop}>
                  {/* Logo placeholder */}
                  <View style={styles.logoWrap}>
                    <Text style={styles.logoText}>{job.company?.charAt(0) || '🏢'}</Text>
                  </View>

                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={2}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                  </View>
                </View>

                <View style={styles.jobMeta}>
                  <View style={styles.metaChip}>
                    <Text style={styles.metaText}>📍 {job.location}</Text>
                  </View>
                  {job.salary && (
                    <View style={[styles.metaChip, styles.salaryChip]}>
                      <Text style={styles.salaryText}>💰 {formatSalary(job.salary)}</Text>
                    </View>
                  )}
                  {job.applies > 0 && (
                    <View style={styles.metaChip}>
                      <Text style={styles.metaText}>👥 {job.applies}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.jobFooter}>
                  <Text style={styles.applyText}>Дэлгэрэнгүй харах →</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Load more */}
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => fetchJobs(page + 1)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#A78BFA" />
              ) : (
                <Text style={styles.loadMoreText}>Дэлгэрэнгүй харах →</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080618' },
  header: { padding: 24, paddingTop: 52, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { marginBottom: 16 },
  backText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 },
  countBadge: { backgroundColor: 'rgba(167,139,250,0.2)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  countText: { color: '#A78BFA', fontSize: 18, fontWeight: '800' },
  countLabel: { color: 'rgba(167,139,250,0.6)', fontSize: 10 },
  body: { padding: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(167,139,250,0.5)', letterSpacing: 1.2, marginBottom: 12 },
  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  jobCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden', position: 'relative',
  },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: '#A78BFA' },
  jobTop: { flexDirection: 'row', gap: 12, marginBottom: 12, marginLeft: 8 },
  logoWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(167,139,250,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)' },
  logoText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  jobInfo: { flex: 1 },
  jobTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  jobCompany: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  jobMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12, marginLeft: 8 },
  metaChip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  salaryChip: { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)', borderWidth: 1 },
  metaText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  salaryText: { color: '#34D399', fontSize: 11, fontWeight: '600' },
  jobFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10, marginLeft: 8 },
  applyText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  loadMoreBtn: { backgroundColor: 'rgba(167,139,250,0.1)', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 4, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  loadMoreText: { color: '#A78BFA', fontWeight: '700' },
});