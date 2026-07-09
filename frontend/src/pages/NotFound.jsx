import { Compass } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState
        icon={Compass}
        title="페이지를 찾을 수 없습니다"
        description="주소를 다시 확인하거나 홈으로 돌아가세요."
        action={<Button to="/">홈으로</Button>}
      />
    </div>
  )
}
