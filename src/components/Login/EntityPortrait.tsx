import { ImgHTMLAttributes, ReactElement } from "react";

interface PortraitProps extends ImgHTMLAttributes<HTMLImageElement> {
  queryId?: number;
  querySize?: number;
}

export const CharacterPortrait = ({
  queryId,
  querySize = 64,
  ...props
}: PortraitProps): ReactElement => (
  <InnerPortrait
    {...props}
    src={
      queryId
        ? `https://images.evetech.net/characters/${queryId}/portrait?size=${querySize}`
        : undefined
    }
  />
);

export const CorporationPortrait = ({
  queryId,
  querySize = 64,
  ...props
}: PortraitProps): ReactElement => (
  <InnerPortrait
    {...props}
    src={
      queryId
        ? `https://images.evetech.net/corporations/${queryId}/logo?size=${querySize}`
        : undefined
    }
  />
);

export const AlliancePortrait = ({
  queryId,
  querySize = 64,
  ...props
}: PortraitProps): ReactElement => (
  <InnerPortrait
    {...props}
    src={
      queryId
        ? `https://images.evetech.net/alliances/${queryId}/logo?size=${querySize}`
        : undefined
    }
  />
);

const InnerPortrait = ({
  queryId,
  querySize = 64,
  alt,
  ...props
}: PortraitProps): ReactElement => (
  <img {...props} alt={alt ? alt : `${queryId}`} />
);

// export const NamedCharacterPortrait = ({
//   queryId,
//   name,
//   imgProps,
// }: {
//   queryId: number;
//   name?: string;
//   imgProps?: ImgHTMLAttributes<HTMLImageElement>;
// }): ReactElement => (
//   <>
//     <CharacterPortrait queryId={queryId} {...imgProps} />
//     <div className="character-name">
//       {name ? name : <CharacterNameFetched queryId={queryId} />}
//     </div>
//   </>
// );

// export const NamedCorporationPortrait = ({
//   queryId,
//   name,
//   imgProps,
// }: {
//   queryId: number;
//   name?: string;
//   imgProps?: ImgHTMLAttributes<HTMLImageElement>;
// }): ReactElement => (
//   <>
//     <CorporationPortrait queryId={queryId} {...imgProps} />
//     <div className="corporation-name">
//       {name ? name : <CorporationNameFetched queryId={queryId} />}
//     </div>
//   </>
// );
