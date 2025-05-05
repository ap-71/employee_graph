import { Stack } from "@mui/material"

export const Loader = () => {
    return <Stack alignItems="center" direction="row" gap={2} justifyContent='center' height="100%">
        <img src="/img/nian-cat.gif" style={{ height: 80 }}  alt='loader'/>
    </Stack>
}