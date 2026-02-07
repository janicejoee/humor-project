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
  captions: CaptionRow[] | null;
};

export type ImageWithTopCaption = {
  image: ImageRow;
  topCaption: CaptionRow;
};
