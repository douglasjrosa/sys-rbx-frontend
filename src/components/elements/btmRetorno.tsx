import { Box, FormLabel, IconButton, Select } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";

export const BtmRetorno = (props: { Url: string }) => {
  const router = useRouter();
  return (
    <>
      <BsArrowLeftCircleFill
        color="blue"
        cursor={'pointer'}
        size={30}
        onClick={() => router.push(props.Url)}
      />
    </>
  );
};
