'use client'

import {useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {useState} from "react"
import {toast} from "sonner"

// shadcn/ui components
import {Card, CardHeader, CardTitle, CardContent, CardFooter} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {Spinner} from "@/components/ui/spinner"

const loginSchema = z.object({
    email: z.email({message: "Invalid email address."}),
    password: z.string().min(6, {message: "Password must be at least 6 characters."}),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage = () => {
    const [loading, setLoading] = useState(false)

    const {register, handleSubmit, formState: {errors}} = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true)

        // simulate async login process (10 seconds)
        await new Promise(resolve => setTimeout(resolve, 10000))

        setLoading(false)
        console.log("Form submitted:", data)

        // show toast after login
        toast.success("Login successful!")
    }

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-100">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="Enter your email" {...register("email")} />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>

                        {/* Password field */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password"
                                   placeholder="Enter your password" {...register("password")} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>

                        {/* Submit button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Spinner className="h-4 w-4"/>
                                    Logging in...
                                </div>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </form>
                </CardContent>
                {/*<CardFooter>*/}
                {/*    /!* Skeleton loader example (optional, for UI polish) *!/*/}
                {/*    {loading && <Skeleton className="w-full h-4"/>}*/}
                {/*</CardFooter>*/}
            </Card>
        </div>
    )
}

export default LoginPage