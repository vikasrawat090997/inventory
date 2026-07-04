import { Injectable, BadRequestException, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtHelper } from './jwt.helper';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Seed initial user on startup if user repository is empty
    const count = await this.userRepository.count();
    if (count === 0) {
      const defaultUser = new RegisterUserDto();
      defaultUser.username = 'netra';
      defaultUser.email = 'netra@yopmail.com';
      defaultUser.password = 'Aa@123456';
      defaultUser.pharmacyName = 'Netra Pharmacy Hall';
      await this.register(defaultUser);
      console.log('Seeded default pharmacist user account: netra / Aa@123456');
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const { username, email, password, pharmacyName } = registerUserDto;

    // Check username existence
    const existingUser = await this.userRepository.findOneBy({ username });
    if (existingUser) {
      throw new BadRequestException('Username is already registered.');
    }

    // Check email existence
    const existingEmail = await this.userRepository.findOneBy({ email });
    if (existingEmail) {
      throw new BadRequestException('Email address is already registered.');
    }

    // Map and save (using bcrypt with 10 salt rounds)
    const user = new User();
    user.username = username;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.pharmacyName = pharmacyName;

    const savedUser = await this.userRepository.save(user);
    
    // Omit password from return object
    const { password: _, ...result } = savedUser;
    return result;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string; username: string; pharmacyName: string }> {
    const { username, password } = loginUserDto;

    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Verify hashed password using bcrypt.compare
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Sign real cryptographic JWT token
    const token = JwtHelper.sign({ id: user.id, username: user.username, pharmacyName: user.pharmacyName });
    return {
      token,
      username: user.username,
      pharmacyName: user.pharmacyName
    };
  }
}
