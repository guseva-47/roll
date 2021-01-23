import { CrashpandasSheet } from "../crashpandas/crashpandas.sheet";
import { NPCCrashpandasSheet } from "../crashpandas/npc.crashpandas.sheet";
import { PlayerCrashpandasSheet } from "../crashpandas/player.crashpandas.sheet";
import { HoneyheistSheet } from "../honeyheist/honeyheist.sheet";
import { NPCHoneyheistSheet } from "../honeyheist/npc.honeyheist.sheet";
import { PlayerHoneyheistSheet } from "../honeyheist/player.honeyheist.sheet";
import { IVisitor } from "./visitor.interface";

class HTMLVisitor implements IVisitor {

    visitCrashpandas(c: CrashpandasSheet): string {
        const info = {skills: c.getSkills()}
        return this.html(info, 'Crashpandas base sheet');
    }
    visitNPCCrashpandas(c: NPCCrashpandasSheet): string {
        const info = {skills: c.getInfo()}
        return this.html(info, 'Crashpandas NPC sheet');
    }
    visitPlayerCrashpandas(c: PlayerCrashpandasSheet): string {
        const info = {skills: c.getInfo()}
        return this.html(info, 'Crashpandas player sheet');
    }
    visitHoneyHeist(c: HoneyheistSheet): string {
        const info = {skills: c.getSkills()}
        return this.html(info, 'HoneyheistSheet base sheet');
    }
    visitNPCHoneyHeist(c: NPCHoneyheistSheet): string {
        const info = {skills: c.getSkills()}
        return this.html(info, 'HoneyheistSheet NPC sheet');
    }
    visitPlayerHoneyheist(c: PlayerHoneyheistSheet): string {
        const info = {skills: c.getSkills()}
        return this.html(info, 'HoneyheistSheet player sheet');
    }

    private html(tablesObject: Record<string, any>, title: string, ): string {
        function had(title: string): string {
            let doc = "<!DOCTYPE html>\n";        
            doc += "\t<head>\n";
            doc += "\t\t<meta charset=\"utf-8\">\n";
            doc += `\t\t<title>${title}</title>\n`;
            doc += "\t\t<style> p { color:  black; } </style>";
            doc += "\t</head>\n";
            doc += "\t<body>\n";
            doc += `\t\t<p>${title}</p>\n`;
            return doc;

        }
        function getHTMLTable(table: Record<string, unknown>, titleTable: string): string {
            let doc = ''
            doc += `\t\t<table border="1">\n`;
           
            doc += `\t\t\t<caption>${titleTable}</caption>\n`;
            for (const skillName in table) {
                doc += '\t\t\t<tr>'
                doc += `<td>${skillName}</td>\n`
                doc += `<td>${table[skillName]}</td>\n`
                doc += '</tr>\n'
            }

            doc += `\t\t</table>\n`;
            return doc;
        }
        function end(): string {
            let doc = "\t</body>\n";
            doc += "</html>\n";
            return doc;
        }

        let doc = had(title);
        for(const tableName in tablesObject) {
            doc += getHTMLTable(tablesObject[tableName], tableName);
        }
        doc += end();
                        
        return doc;
    }

}