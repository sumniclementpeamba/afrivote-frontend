export interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string;
  organization_type: string;
  status: string;
}

export interface Election {
  id: string;
  title: string;
  description?: string;
  election_type: string;
  status: string;
  start_date: string;
  end_date: string;
  organization_name?: string;
  total_votes?: number;
}

export interface Position {
  id: string;
  title: string;
  election: string;
  election_title?: string;
  max_selections: number;
  is_required: boolean;
  candidate_count: number;
}

export interface Candidate {
  photo(photo: any): string | Blob | undefined;
  id: string;
  name: string;
  position: string;
  position_title?: string;
  department?: string;
  is_approved: boolean;
  is_active: boolean;
  vote_count: number;
  vote_percentage: number;
}

export interface Voter {
  id: string;
  voter_id: string;
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
  is_verified: boolean;
  has_voted: boolean;
}