export interface StatusType {
  builtIn: boolean;
  category: string;
  name: string;
  namePinyin: string;
  uuid: string;
}

export interface IssueType {
  name: string;
}

export interface ImportantFieldType {
  bgColor: string;
  color: string;
  fieldUUID: string;
  name: string;
  uuid: string;
  value: string;
}

export interface fieldValueType {
  field_uuid: string;
  value: string;
}

export interface Task {
  summary: string;
  estimatedHours: number;
  // issueType: IssueType
  sub_issue_type_uuid: string;
  importantField: ImportantFieldType[];
  key: string;
  name: string;
  planEndDate: number;
  planStartDate: number;
  // project: Project
  status: StatusType;
  issueType: IssueType;
  subIssueType: any;
  totalActualHours: number;
  uuid: string;
  _fStamp: number;
  field_values: fieldValueType[];
}

export interface onesConfig {
  isUpdate?: string;
  [key: string]: string | boolean | undefined;
}

export interface GithubBranchParam {
  owner: string;
  repo: string;
  head?: string;
  ref?: string;
  sha?: string;
}

export interface commitHashResultItem {
  name: string;
  hash: string;
  loading: boolean;
  success: boolean;
  reason: string;
}

export interface RuntimeMessage {
  type: string;
  data: any;
}
