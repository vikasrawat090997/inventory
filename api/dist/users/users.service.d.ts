import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
export declare class UsersService implements OnModuleInit {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    onModuleInit(): Promise<void>;
    register(registerUserDto: RegisterUserDto): Promise<Omit<User, 'password'>>;
    login(loginUserDto: LoginUserDto): Promise<{
        token: string;
        username: string;
        pharmacyName: string;
    }>;
}
