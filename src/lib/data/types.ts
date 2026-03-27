export type CaptionRow = {
  id: string;
  content: string | null;
  like_count: number;
  is_public: boolean;
};

export type ImageRow = {
  id: string;
  url: string | null;
  image_description: string | null;
  is_public: boolean | null;
  created_datetime_utc?: string | null;
  captions: CaptionRow[] | null;
};

export type ImageWithTopCaption = {
  image: ImageRow;
  topCaption: CaptionRow;
  /** User has liked (thumb up). */
  userHasVoted?: boolean;
  /** User has disliked (thumb down). */
  userHasDisliked?: boolean;
};

export type ProfileRow = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};
