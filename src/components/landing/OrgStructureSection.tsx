import { Member, Position, Division } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type OrgData = (Division & { positions: (Position & { members: Member[] })[] })[];

interface OrgStructureSectionProps {
  data: OrgData;
}

export function OrgStructureSection({ data }: OrgStructureSectionProps) {
  // Separate Inti from others
  const inti = data.find((d) => d.name === "Inti");
  const others = data.filter((d) => {
     if (d.name === "Inti") return false;
     // Check if division has any members
     const totalMembers = d.positions.reduce((acc, pos) => acc + pos.members.length, 0);
     return totalMembers > 0;
  });

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const MemberCard = ({ member, title }: { member: Member; title: string }) => (
    <Card className="w-full max-w-sm mx-auto overflow-hidden transition-all hover:shadow-md h-full">
      <div className="aspect-square relative w-full overflow-hidden bg-muted">
         {/* Use a placeholder if no photo, or styles */}
         <img 
            src={member.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} 
            alt={member.name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
         />
      </div>
      <CardContent className="p-4 text-center space-y-2">
        <h3 className="font-bold text-lg leading-tight truncate" title={member.name}>{member.name}</h3>
        <Badge variant="secondary" className="mb-2">{title}</Badge>
        <div className="text-sm text-muted-foreground">
          <p>{member.npm}</p>
          <p className="truncate" title={member.major}>{member.major}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50" id="struktur">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-foreground text-background px-3 py-1 text-sm">
            Tim Kami
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
            Struktur Organisasi
          </h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Kenalan dengan orang-orang hebat dibalik KKM Mata Mamplam.
          </p>
        </div>

        {/* Inti Section */}
        {inti && (
          <div className="space-y-12 mb-16">
             {/* Ketua */}
             <div className="flex justify-center">
                {inti.positions
                  .filter(p => p.level === 1)
                  .flatMap(p => p.members.map(m => <div key={m.id} className="w-full max-w-xs"><MemberCard member={m} title={p.title} /></div>))}
             </div>
             
             {/* Wakil */}
             <div className="flex justify-center gap-6 flex-wrap">
                {inti.positions
                  .filter(p => p.level === 2)
                  .flatMap(p => p.members.map(m => <div key={m.id} className="w-full max-w-xs"><MemberCard member={m} title={p.title} /></div>))}
             </div>

             {/* Sekretaris & Bendahara */}
             <div className="flex justify-center gap-6 flex-wrap">
                {inti.positions
                  .filter(p => p.level === 3)
                  .flatMap(p => p.members.map(m => <div key={m.id} className="w-full max-w-xs"><MemberCard member={m} title={p.title} /></div>))}
             </div>
          </div>
        )}

        {/* Divisions Section */}
        <div className="flex flex-wrap justify-center gap-8">
           {others.map((div) => (
             <div key={div.id} className="bg-background rounded-xl p-6 shadow-sm border w-full md:w-[calc(50%-2rem)] lg:w-[calc(33.33%-2rem)] min-w-[300px]">
                <h3 className="text-2xl font-bold mb-6 text-center border-b pb-4">{div.name}</h3>
                <div className="space-y-8">
                   {/* Ketua Divisi First */}
                   {div.positions.sort((a,b) => a.level - b.level).map(pos => (
                      <div key={pos.id} className="space-y-4">
                         {pos.members.length > 0 && (
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                               {pos.members.map(m => (
                                 <Dialog key={m.id}>
                                   <DialogTrigger asChild>
                                      <div className="col-span-full cursor-pointer"> {/* Force full width in division column for now or customize */}
                                         <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                            <Avatar className="h-12 w-12 group-hover:scale-110 transition-transform">
                                               <AvatarImage src={m.photoUrl || ""} />
                                               <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="overflow-hidden text-left">
                                               <p className="font-medium truncate group-hover:text-primary transition-colors">{m.name}</p>
                                               <p className="text-xs text-muted-foreground">{pos.title}</p>
                                            </div>
                                         </div>
                                      </div>
                                   </DialogTrigger>
                                   <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                         <DialogTitle className="text-center">Detail Anggota</DialogTitle>
                                      </DialogHeader>
                                      <div className="flex flex-col items-center space-y-4 py-4">
                                         <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-muted">
                                            <img
                                               src={m.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`}
                                               alt={m.name}
                                               className="object-cover w-full h-full"
                                            />
                                         </div>
                                         <div className="text-center space-y-2">
                                            <h3 className="text-2xl font-bold">{m.name}</h3>
                                            <Badge variant="outline" className="text-base px-4 py-1 border-primary/50 text-primary bg-primary/5">
                                               {pos.title}
                                            </Badge>
                                            <div className="space-y-1 text-muted-foreground pt-2">
                                               <p className="font-medium text-foreground">{m.major}</p>
                                               <p className="text-sm">NPM: {m.npm}</p>
                                               <p className="text-xs pt-2">Divisi {div.name}</p>
                                            </div>
                                         </div>
                                      </div>
                                   </DialogContent>
                                 </Dialog>
                               ))}
                            </div>
                         )}
                      </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

      </div>
    </section>
  );
}
