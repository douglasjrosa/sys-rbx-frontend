import classNames from "classnames";
import Image from "../elements/image";
import Video from "../elements/video";
import CustomLink from "../elements/custom-link";

const FeatureRowsGroup = ({ data }) => {
  return (
    <div className="container flex flex-col gap-12 py-12">
      {data.features.map((feature, index) => (
        <div
          className={classNames(
            // Common classes
            "flex flex-col justify-start rounded-lg shadow-lg md:items-center bg-white lg:gap-28",
            {
              "lg:flex-row": index % 2 === 0,
              "lg:flex-row-reverse": index % 2 === 1,
            }
          )}
          key={feature.id}
        >
          {/* Media section */}
          <div className="w-full sm:9/12 lg:w-4/12 max-h-full">
            {/* Images */}
            {feature.media.mime.startsWith("image") && (
              <Image media={feature.media} className={classNames(
                "w-full h-auto rounded-t-lg lg:rounded-none",
                {
                  "lg:rounded-l-lg": index % 2 === 0,
                  "lg:rounded-r-lg": index % 2 === 1
                }
              )} />
            )}
            {/* Videos */}
            {feature.media.mime.startsWith("video") && (
              <Video
                media={feature.media}
                className="w-full h-auto"
                autoPlay
                controls={false}
              />
            )}
          </div>
          {/* Text section */}
          <div className="w-full lg:w-6/12 text-lg p-5">
            <h3 className="title">{feature.title}</h3>
            <div className="my-6">{feature.description}</div>
            <CustomLink link={feature.link}>
              <div className="text-blue-600 with-arrow hover:underline">
                {feature.link.text}
              </div>
            </CustomLink>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureRowsGroup;
