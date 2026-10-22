import Container from "@/components/ui/container";
import FollowUnFollowButton from "@/components/ui/follow-unfollow-button";
import { getPostsByUserId } from "@/services/post";
import { getUserByUsername } from "@/services/user";
import { IPost, IUser } from "@/types";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Metadata } from "next";
import Link from "next/link";
import { AiOutlineSmallDash } from "react-icons/ai";
import { BsTwitterX } from "react-icons/bs";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { GoPencil } from "react-icons/go";
import { IoDiamondOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { PiCalendarDotsLight } from "react-icons/pi";
import { TbArrowBadgeDown } from "react-icons/tb";
import ProfileShareDropdown from "@/components/ui/profile-share-dropdown";
import AdBanner from "@/components/adsense/ad-banner";

type Props = {
  params: { username: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const actualUsername = params.username.split("40")[1];
  const data = await getUserByUsername(actualUsername);
  const { fullName, profilePicture } = (data.data as IUser) ?? {};

  return {
    title: `${fullName}'s Profile`,
    description: `Explore ${fullName}'s profile on TechTips Hub. Discover their shared insights, tutorials, and contributions to the tech community.`,
    keywords: `${fullName}, TechTips Hub, user profile, tech community, articles, tutorials`,
    openGraph: {
      title: `${fullName}'s Profile`,
      description: `Check out ${fullName}'s profile on TechTips Hub. See their latest articles, contributions, and interests in the tech world.`,
      url: `https://techtipshub.vercel.app/users/@${actualUsername}`,
      images: profilePicture ? [{ url: profilePicture }] : [],
    },
  };
}

const GetUserByIdPage = async ({
  params,
}: {
  params: { username: string };
}) => {
  const data = await getUserByUsername(params.username.split("40")[1]);

  const {
    username,
    _id,
    profilePicture,
    fullName,
    isVerified,
    isPremiumUser,
    totalFollowers,
    totalFollowing,
    location,
    bio,
    designation,
    createdAt,
    totalPosts,
    socialLinks,
  } = (data.data as IUser) ?? {};

  const postsData = await getPostsByUserId(_id);
  const posts = postsData?.data as IPost[];

  return (
    <section className="py-10">
      <Container>
        <div className="lg:border border-default/50 lg:py-8 lg:px-14 rounded-xl space-y-8 w-full">
          <div className="w-full flex items-start justify-between">
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row items-start lg:space-x-6">
              <Avatar
                color="primary"
                className="w-28 h-28 lg:size-40 object-cover"
                radius="full"
                src={profilePicture}
                isBordered
              />
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{fullName}</h1>
                  {designation && <p>{designation}</p>}
                </div>

                <div className="flex items-center space-x-4">
                  {isVerified && (
                    <div className="flex space-x-2 items-center">
                      <MdVerified className="text-lg text-primary" />
                      <span>Verified</span>
                    </div>
                  )}
                  {isPremiumUser ? (
                    <div className="flex space-x-2 items-center">
                      <IoDiamondOutline className="text-lg text-primary" />
                      <span>Premium User</span>
                    </div>
                  ) : (
                    <div className="flex space-x-2 items-center">
                      <TbArrowBadgeDown className="text-2xl text-primary" />
                      <span>Basic User</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    href={`/@${username}/following`}
                    size="sm"
                    variant="flat"
                    radius="full"
                  >
                    {totalFollowing} Following
                  </Button>
                  <Button
                    href={`/@${username}/followers`}
                    size="sm"
                    variant="flat"
                    radius="full"
                  >
                    {totalFollowers} Followers
                  </Button>
                  <Button size="sm" variant="flat" radius="full">
                    {totalPosts} Blog Posts
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 absolute right-2 lg:static">
              <ProfileShareDropdown />

              <FollowUnFollowButton id={_id} />
            </div>
          </div>

          <div className="border border-default/50 p-4 py-6 lg:p-6 rounded-lg flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-center lg:space-x-14 w-full">
            <ul className="flex items-center space-x-6 text-lg text-default-600">
              {socialLinks &&
                socialLinks.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {(social.platform === "Linkedin" && <FaLinkedin />) ||
                        (social.platform === "Twitter" && <BsTwitterX />) ||
                        (social.platform === "Github" && <FaGithub />) ||
                        (social.platform === "Facebook" && <FaFacebook />) ||
                        (social.platform === "Instagram" && <FaInstagram />) ||
                        (social.platform === "Youtube" && <FaYoutube />)}
                    </a>
                  </li>
                ))}
            </ul>

            {location && (
              <div className="text-default-600 flex space-x-2 items-center">
                <FiMapPin className="text-lg" />
                <span>{location}</span>
              </div>
            )}

            <div className="text-default-600 flex space-x-2 items-center">
              <PiCalendarDotsLight className="text-lg" />
              <span>
                Member Since, {createdAt && new Date(createdAt).toDateString()}
              </span>
            </div>
          </div>

          <div className="border border-default/50 p-4 lg:p-6 rounded-lg space-y-6">
            <h2 className="text-xl font-bold">About Me</h2>
            {bio && <p>{bio}</p>}
          </div>

          <div className="border border-default/50 p-4 lg:p-6 rounded-lg space-y-6">
            <h2 className="text-xl font-bold">Recent Activity</h2>

            <div>
              {posts &&
                posts?.map((post) => (
                  <Link
                    href={`/blogs/${post.slug}`}
                    key={post._id}
                    className="flex space-x-2 lg:space-x-10 mt-2"
                  >
                    <div className="flex flex-col items-center space-y-1 basis-[25%] lg:basis-auto">
                      <span className="text-xs text-center lg:text-sm lg:text-start">
                        {new Date(post.createdAt).toDateString()}
                      </span>
                      <AiOutlineSmallDash className="rotate-90 text-primary text-lg" />
                    </div>
                    <div className="space-y-1 flex-1 lg:flex-auto border-b border-default/50 pb-2">
                      <div className="text-default-500 flex items-center space-x-4">
                        <div className="space-x-2 flex items-center">
                          <GoPencil />
                          <span>Wrote an article</span>
                        </div>
                        {post.isPremium && (
                          <Button
                            radius="full"
                            size="sm"
                            color="secondary"
                            variant="flat"
                          >
                            Premium
                          </Button>
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-semibold ">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AdBanner />
        </div>
      </Container>
    </section>
  );
};

export default GetUserByIdPage;
