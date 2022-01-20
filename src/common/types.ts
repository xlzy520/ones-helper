export interface StatusType {
  builtIn: boolean
  category: string
  name: string
  namePinyin: string
  uuid: string
}

export interface ImportantFieldType {
  bgColor: string
  color: string
  fieldUUID: string
  name: string
  uuid: string
  value: string
}

export interface Task {
  estimatedHours: number
  // issueType: IssueType
  importantField: ImportantFieldType[]
  key: string
  name: string
  planEndDate: number
  planStartDate: number
  // project: Project
  status: StatusType
  subIssueType: any
  totalActualHours: number
  uuid: string
  _fStamp: number
}

export interface onesConfig {
  isUpdate?: boolean
  [key: string]: string | boolean| undefined
}

export interface GithubBranchParam {
  owner: string
  repo: string
  head: string
  ref: string
  sha: string
}
