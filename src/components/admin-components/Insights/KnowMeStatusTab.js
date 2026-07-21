import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Spin, Empty, Table, Tag, Select, Typography, Divider, Card, Row, Col } from 'antd';
import { onFetchingKnowMeAiStatusByCourse } from 'redux/actions/Lrn';
import ColumnBar from 'components/layout-components/Graphs/ColumnGraph';

const { Text, Paragraph, Title } = Typography;

const STATUS_TAG = {
  completed:  { color: 'success',    label: 'Completed' },
  pending:    { color: 'processing', label: 'Pending' },
  processing: { color: 'warning',    label: 'Processing' },
  failed:     { color: 'error',      label: 'Failed' },
};

const EssayCards = ({ originalEssays, correctedEssays, feedback }) => {
  const questionIds = Object.keys(originalEssays || correctedEssays || feedback || {});
  if (!questionIds.length) return <Text type="secondary">No essay content available.</Text>;

  return questionIds.map(qid => {
    const original  = originalEssays?.[qid];
    const corrected = correctedEssays?.[qid];
    const fb        = feedback?.[qid];
    const hasEnFeedback     = fb && (fb.summary || fb.grammarNotes?.length > 0 || fb.vocabularySuggestions?.length > 0);
    const hasNativeFeedback = fb && (fb.nativeSummary || fb.nativeGrammarNotes?.length > 0 || fb.nativeVocabularySuggestions?.length > 0);

    if (!original && !corrected && !fb) return null;

    return (
      <Card key={qid} style={{ marginBottom: 12 }} variant="outlined">
        <Title level={5} style={{ marginTop: 0 }}>{qid}</Title>

        {original && (
          <>
            <Text type="secondary">Student's answer</Text>
            <Paragraph style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 6, padding: '10px 14px', marginTop: 6 }}>
              {original}
            </Paragraph>
          </>
        )}

        {corrected && (
          <>
            <Divider style={{ margin: '10px 0' }} />
            <Text type="secondary">Corrected version</Text>
            <Paragraph style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6, padding: '10px 14px', marginTop: 6 }}>
              {corrected}
            </Paragraph>
          </>
        )}

        {hasEnFeedback && (
          <>
            <Divider style={{ margin: '10px 0' }} />
            <Text strong>Feedback</Text>
            {fb.summary && <Paragraph style={{ marginTop: 6 }}>{fb.summary}</Paragraph>}
            {fb.grammarNotes?.length > 0 && (
              <>
                <Text type="secondary" style={{ fontSize: 12 }}>Grammar notes</Text>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {fb.grammarNotes.map((note, i) => <li key={i}><Paragraph style={{ margin: 0 }}>{note}</Paragraph></li>)}
                </ul>
              </>
            )}
            {fb.vocabularySuggestions?.length > 0 && (
              <>
                <Text type="secondary" style={{ fontSize: 12 }}>Vocabulary suggestions</Text>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {fb.vocabularySuggestions.map((s, i) => <li key={i}><Paragraph style={{ margin: 0 }}>{s}</Paragraph></li>)}
                </ul>
              </>
            )}
          </>
        )}

        {hasNativeFeedback && (
          <>
            <Divider style={{ margin: '10px 0' }} />
            <Text strong>Retroalimentación</Text>
            {fb.nativeSummary && <Paragraph style={{ marginTop: 6 }}>{fb.nativeSummary}</Paragraph>}
            {fb.nativeGrammarNotes?.length > 0 && (
              <>
                <Text type="secondary" style={{ fontSize: 12 }}>Notas de gramática</Text>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {fb.nativeGrammarNotes.map((note, i) => <li key={i}><Paragraph style={{ margin: 0 }}>{note}</Paragraph></li>)}
                </ul>
              </>
            )}
            {fb.nativeVocabularySuggestions?.length > 0 && (
              <>
                <Text type="secondary" style={{ fontSize: 12 }}>Sugerencias de vocabulario</Text>
                <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                  {fb.nativeVocabularySuggestions.map((s, i) => <li key={i}><Paragraph style={{ margin: 0 }}>{s}</Paragraph></li>)}
                </ul>
              </>
            )}
          </>
        )}
      </Card>
    );
  });
};

const KnowMeStatusTab = ({ courseCodeId, user, onFetchingKnowMeAiStatusByCourse }) => {
  const [loading, setLoading]         = useState(false);
  const [entries, setEntries]         = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    if (!courseCodeId || !user?.emailId) return;
    let cancelled = false;

    const fetchStatus = async () => {
      setLoading(true);
      const result = await onFetchingKnowMeAiStatusByCourse(courseCodeId, user.emailId);
      if (!cancelled) {
        setEntries(result?.entries ?? []);
        setLoading(false);
      }
    };

    fetchStatus();
    return () => { cancelled = true; };
  }, [courseCodeId, user?.emailId]); // eslint-disable-line react-hooks/exhaustive-deps

  const classNumbers = useMemo(
    () => [...new Set(entries.map(e => e.classNumber))].sort((a, b) => a - b),
    [entries]
  );

  const chartData = useMemo(
    () => classNumbers.map(cn => ({
      type: `Ch. ${cn}`,
      count: entries.filter(e => e.classNumber === cn).length
    })),
    [classNumbers, entries]
  );

  const filtered = useMemo(
    () => selectedClass != null ? entries.filter(e => e.classNumber === selectedClass) : entries,
    [entries, selectedClass]
  );

  const columns = [
    {
      title: 'Student',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Chapter',
      dataIndex: 'classNumber',
      key: 'classNumber',
      width: 90,
      render: v => `Ch. ${v}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: status => {
        const cfg = STATUS_TAG[status];
        return cfg
          ? <Tag color={cfg.color}>{cfg.label}</Tag>
          : <Tag color="default">No status</Tag>;
      }
    },
    {
      title: 'Completed',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 180,
      render: v => v ? new Date(v).toLocaleString() : '—'
    }
  ];

  if (loading) {
    return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  }

  if (!entries.length) {
    return <Empty description="No Know Me submissions for this course yet." style={{ margin: '60px auto' }} />;
  }

  return (
    <>
      {chartData.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <ColumnBar
              localizedTitle="Know Me Submissions per Chapter"
              graphData={chartData}
              passedValue="count"
              passedType="type"
              symbol=""
            />
          </Col>
        </Row>
      )}

      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Filter by chapter"
          value={selectedClass}
          onChange={setSelectedClass}
          style={{ width: 200 }}
          options={classNumbers.map(cn => ({ value: cn, label: `Chapter ${cn}` }))}
        />
      </div>

      <Table
        dataSource={filtered}
        columns={columns}
        rowKey={r => `${r.contactInternalId}-${r.classNumber}`}
        expandable={{
          expandedRowRender: record => (
            <EssayCards
              originalEssays={record.originalEssays}
              correctedEssays={record.correctedEssays}
              feedback={record.feedback}
            />
          )
        }}
        pagination={{ pageSize: 20 }}
      />
    </>
  );
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ onFetchingKnowMeAiStatusByCourse }, dispatch);
}

const mapStateToProps = ({ grant }) => {
  const { user } = grant;
  return { user };
};

export default connect(mapStateToProps, mapDispatchToProps)(KnowMeStatusTab);
