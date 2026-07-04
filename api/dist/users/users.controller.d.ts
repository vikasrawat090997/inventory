import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(registerUserDto: RegisterUserDto): Promise<Omit<import("./user.entity").User, "password">>;
    login(loginUserDto: LoginUserDto): Promise<{
        token: string;
        username: string;
        pharmacyName: string;
    }>;
}
