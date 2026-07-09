import { useEffect, useMemo, useState } from 'react'
import { Users, SearchX } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import SearchBar from '../../components/SearchBar'
import { listMembers } from '../../api/members'
import { getErrorMessage } from '../../utils/errors'
import './Admin.css'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchMembers() {
      setLoading(true)
      setError('')
      try {
        const data = await listMembers()
        if (!cancelled) setMembers(data ?? [])
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchMembers()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return members
    return members.filter((m) =>
      [m.memberId, m.name, m.email, m.phone].some((f) => f?.toLowerCase().includes(needle)),
    )
  }, [members, query])

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Community</p>
          <h1>회원 관리</h1>
          <p>전체 회원 목록입니다. 회원 정보는 각자 마이페이지에서만 수정할 수 있습니다.</p>
        </div>
      </header>

      {loading && <Loader label="회원 목록을 불러오는 중..." fullHeight />}

      {!loading && error && (
        <EmptyState
          icon={SearchX}
          title="회원 목록을 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setRefreshKey((k) => k + 1)}>
              다시 시도
            </Button>
          }
        />
      )}

      {!loading && !error && (
        <>
          <div className="admin-toolbar">
            <div className="admin-toolbar__search admin-members-search">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="아이디, 이름, 이메일, 연락처 검색"
              />
            </div>
            <span className="admin-count">
              전체 {members.length}명 중 {filtered.length}명 표시
            </span>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={members.length === 0 ? '등록된 회원이 없습니다' : '검색 결과가 없습니다'}
              description={members.length === 0 ? '' : '다른 검색어를 시도해보세요.'}
            />
          ) : (
            <GlassPanel className="admin-panel">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>아이디</th>
                      <th>이름</th>
                      <th>연락처</th>
                      <th>이메일</th>
                      <th>주소</th>
                      <th>권한</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((member) => (
                      <tr key={member.id}>
                        <td className="admin-table__primary">{member.memberId}</td>
                        <td>{member.name}</td>
                        <td>{member.phone}</td>
                        <td>{member.email}</td>
                        <td className="admin-table__muted">{member.address}</td>
                        <td>
                          <span
                            className={`admin-table__badge ${member.role === 'ADMIN' ? 'admin-table__badge--accent' : ''}`}
                          >
                            {member.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          )}
        </>
      )}
    </>
  )
}
