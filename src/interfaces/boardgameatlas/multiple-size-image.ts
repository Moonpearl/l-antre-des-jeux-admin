type ImageSize = 'original' | 'small' | 'medium' | 'large' | 'thumb';

type MultipleSizeImage = {
  [name in ImageSize]: string;
}

export default MultipleSizeImage;
