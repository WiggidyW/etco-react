import { ReactElement, SVGProps as ReactSVGProps } from "react";

export type SVGProps = Omit<ReactSVGProps<SVGSVGElement>, "viewBox" | "xmlns">;

export const AddAll = (props: SVGProps): ReactElement => (
  <svg {...props} viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    {/* <!-- License: MIT. Made by framework7io: https://github.com/framework7io/framework7-icons --> */}
    <path d="M 7.6883 23.1104 C 7.6883 17.1164 10.8653 13.9818 16.9016 13.9818 L 45.4100 13.9818 L 45.4100 13.4523 C 45.4100 9.0892 43.1861 6.8865 38.7803 6.8865 L 6.6505 6.8865 C 2.2239 6.8865 0 9.0892 0 13.4523 L 0 35.7548 C 0 40.1179 2.2239 42.2994 6.6505 42.2994 L 7.6883 42.2994 Z M 17.2405 52.5082 L 49.3495 52.5082 C 53.7548 52.5082 56 50.3055 56 45.9424 L 56 23.4281 C 56 19.0861 53.7548 16.8834 49.3495 16.8834 L 17.2405 16.8834 C 12.7927 16.8834 10.5900 19.0650 10.5900 23.4281 L 10.5900 45.9424 C 10.5900 50.3055 12.7927 52.5082 17.2405 52.5082 Z M 33.2949 45.1164 C 32.0453 45.1164 31.2617 44.2268 31.2617 42.8501 L 31.2617 36.9409 L 25.0983 36.9409 C 23.7004 36.9409 22.7896 36.1360 22.7896 34.9288 C 22.7896 33.6580 23.6792 32.8532 25.0983 32.8532 L 31.2617 32.8532 L 31.2617 26.5627 C 31.2617 25.1648 32.0453 24.2753 33.2949 24.2753 C 34.5445 24.2753 35.3494 25.1648 35.3494 26.5627 L 35.3494 32.8532 L 41.5552 32.8532 C 42.9740 32.8532 43.8216 33.6368 43.8216 34.9288 C 43.8216 36.1572 42.9319 36.9409 41.5552 36.9409 L 35.3494 36.9409 L 35.3494 42.8501 C 35.3494 44.2480 34.5445 45.1164 33.2949 45.1164 Z" />
  </svg>
);

export const DelAll = (props: SVGProps): ReactElement => (
  <svg {...props} viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    {/* <!-- License: MIT. Made by framework7io: https://github.com/framework7io/framework7-icons --> */}
    <path d="M 13.7851 49.5742 L 42.2382 49.5742 C 47.1366 49.5742 49.5743 47.1367 49.5743 42.3086 L 49.5743 13.6914 C 49.5743 8.8633 47.1366 6.4258 42.2382 6.4258 L 13.7851 6.4258 C 8.9101 6.4258 6.4257 8.8398 6.4257 13.6914 L 6.4257 42.3086 C 6.4257 47.1602 8.9101 49.5742 13.7851 49.5742 Z M 19.6210 38.3711 C 18.5195 38.3711 17.6523 37.4805 17.6523 36.3789 C 17.6523 35.8398 17.8632 35.3711 18.2382 35.0196 L 25.2460 27.9883 L 18.2382 20.9571 C 17.8632 20.6289 17.6523 20.1367 17.6523 19.5977 C 17.6523 18.5196 18.5195 17.6523 19.6210 17.6523 C 20.1601 17.6523 20.6288 17.8633 20.9804 18.2383 L 28.0117 25.2461 L 35.0898 18.2149 C 35.4882 17.7930 35.9335 17.6055 36.4492 17.6055 C 37.5273 17.6055 38.4179 18.4961 38.4179 19.5742 C 38.4179 20.1133 38.2539 20.5586 37.8320 20.9336 L 30.8007 27.9883 L 37.8085 34.9727 C 38.1835 35.3477 38.3944 35.8164 38.3944 36.3789 C 38.3944 37.4805 37.5039 38.3711 36.4257 38.3711 C 35.8632 38.3711 35.3710 38.1367 35.0195 37.7852 L 28.0117 30.7539 L 21.0273 37.7852 C 20.6757 38.1602 20.1601 38.3711 19.6210 38.3711 Z" />
  </svg>
);

export const VectorUp = (props: SVGProps): ReactElement => (
  <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {/* <!-- License: MIT. Part of MUI: https://mui.com/ --> */}
    <path d="M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
  </svg>
);

export const VectorDown = (props: SVGProps): ReactElement => (
  <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {/* <!-- License: MIT. Part of MUI: https://mui.com/ --> */}
    <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
  </svg>
);

export const CopyClipboard = (props: SVGProps): ReactElement => (
  <svg {...props} viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
    {/* <!-- License: MIT. Made by instructure-ui: https://github.com/instructure/instructure-ui --> */}
    <path
      d="M0 1919.887h1467.88V452.008H0v1467.88ZM1354.965 564.922v1242.051H112.914V564.922h1242.051ZM1920 0v1467.992h-338.741v-113.027h225.827V112.914H565.035V338.74H452.008V0H1920ZM338.741 1016.93h790.397V904.016H338.74v112.914Zm0 451.062h790.397v-113.027H338.74v113.027Zm0-225.588h564.57v-112.913H338.74v112.913Z"
      fillRule="evenodd"
    />
  </svg>
);

export const SearchIcon = (props: SVGProps): ReactElement => (
  <svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="10"
      cy="10"
      r="6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M14.5 14.5L19 19"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
