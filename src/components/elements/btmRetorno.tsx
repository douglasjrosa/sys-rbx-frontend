import { Box, FormLabel, IconButton, Select } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import { FaArrowLeft } from "react-icons/fa";

export const BtmRetorno = (props: { Url: string }) => {
  const router = useRouter();
  return (
    <>
      <IconButton aria-label='voltar' rounded={'3xl'} onClick={() => router.push(props.Url)} icon={<BsArrowLeftCircleFill size={30} color="#136dcc" />} />
    </>
  );
};
